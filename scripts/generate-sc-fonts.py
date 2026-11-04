"""Regenerate additional Han shards; original full-coverage fonts remain byte-identical.

Install the pinned optional requirements in a temporary environment. This script is
not part of the website build. Sources already checked into the asset directory
are used offline; --download explicitly restores missing sources from pinned URLs.
"""

import argparse
import hashlib
import importlib.metadata
import io
import json
from pathlib import Path
from urllib.request import urlopen

from fontTools import subset
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib import TTFont


DEFAULT_DIRECTORY = Path(__file__).resolve().parents[1] / "src/app/zh-cn/fonts"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def codepoints(specification):
    result = set()
    for part in specification.lower().replace(" ", "").split(","):
        start, *end = part.removeprefix("u+").split("-")
        stop = end[0] if end else start
        result.update(range(int(start.replace("?", "0"), 16), int(stop.replace("?", "f"), 16) + 1))
    return result


def unicode_range(characters):
    ordered = sorted(characters)
    spans = []
    for point in ordered:
        if spans and point == spans[-1][1] + 1:
            spans[-1][1] = point
        else:
            spans.append([point, point])
    return ",".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in spans)


def gsub_rules(font):
    if "GSUB" not in font:
        return set()
    table = font["GSUB"].table
    rules = set()
    for script_record in table.ScriptList.ScriptRecord:
        script = script_record.Script
        languages = [("default", script.DefaultLangSys)] + [
            (record.LangSysTag, record.LangSys) for record in script.LangSysRecord
        ]
        for language, system in languages:
            if system is None:
                continue
            indices = list(system.FeatureIndex)
            if system.ReqFeatureIndex != 65535:
                indices.append(system.ReqFeatureIndex)
            for index in indices:
                feature = table.FeatureList.FeatureRecord[index]
                for lookup_index in feature.Feature.LookupListIndex:
                    lookup = table.LookupList.Lookup[lookup_index]
                    for subtable in lookup.SubTable:
                        if lookup.LookupType == 1:
                            values = [((a,), b) for a, b in subtable.mapping.items()]
                        elif lookup.LookupType == 4:
                            values = [
                                ((first, *ligature.Component), ligature.LigGlyph)
                                for first, ligatures in subtable.ligatures.items()
                                for ligature in ligatures
                            ]
                        else:
                            raise AssertionError("Review unsupported GSUB lookup before changing this font source")
                        for inputs, output in values:
                            rules.add((script_record.ScriptTag, language, feature.FeatureTag, inputs, output))
    return rules


def verify_core(source, output, retained_order, selected):
    original_cmap = source.getBestCmap()
    assert set(output.getBestCmap()) == selected
    assert [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in source["fvar"].axes] == [
        (a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in output["fvar"].axes
    ]
    assert source["head"].unitsPerEm == output["head"].unitsPerEm
    for table, attributes in [("hhea", ["ascent", "descent", "lineGap"]), ("vhea", ["ascent", "descent", "lineGap"])]:
        assert all(getattr(source[table], key) == getattr(output[table], key) for key in attributes)
    mapping = dict(zip(retained_order, output.getGlyphOrder(), strict=True))
    inverse = {new: old for old, new in mapping.items()}
    expected = {rule for rule in gsub_rules(source) if all(glyph in mapping for glyph in rule[3])}
    actual = {
        (script, language, feature, tuple(inverse[g] for g in inputs), inverse[result])
        for script, language, feature, inputs, result in gsub_rules(output)
    }
    assert actual == expected, "GSUB script/language/substitution behavior changed"
    for weight in [100, 400, 600, 700, 900]:
        before = source.getGlyphSet(location={"wght": weight})
        after = output.getGlyphSet(location={"wght": weight})
        for original, regenerated in mapping.items():
            first, second = before[original], after[regenerated]
            assert first.width == second.width, "Glyph advance changed"
            first_pen, second_pen = DecomposingRecordingPen(before), DecomposingRecordingPen(after)
            first.draw(first_pen)
            second.draw(second_pen)
            assert first_pen.value == second_pen.value, "Glyph outline changed"
    assert {original_cmap[c] for c in selected}.issubset(mapping)


def make_core(data, selected):
    source = TTFont(io.BytesIO(data), recalcTimestamp=False)
    cmap = source.getBestCmap()
    variation_bases = {
        base for table in source["cmap"].tables if table.format == 14
        for pairs in table.uvsDict.values() for base, _ in pairs
    }
    assert selected.isdisjoint(variation_bases), "Variation sequences must remain in the untouched original font"
    assert selected.issubset(cmap)
    assert all(0x3400 <= c <= 0x9FFF or 0x20000 <= c <= 0x3134F for c in selected)
    rules = gsub_rules(source)
    relevant = {cmap[c] for c in selected}
    while True:
        closure = relevant | {result for *_, inputs, result in rules if len(inputs) == 1 and inputs[0] in relevant}
        if closure == relevant:
            break
        relevant = closure
    assert not any(
        len(inputs) > 1 and (set(inputs) | {result}) & relevant
        for *_, inputs, result in rules
    ), "Do not split ligature/context clusters"
    if "GPOS" in source:
        for lookup in source["GPOS"].table.LookupList.Lookup:
            for subtable in lookup.SubTable:
                lookup_type = getattr(subtable, "ExtensionLookupType", lookup.LookupType)
                assert lookup_type in (1, 2, 4), "Review unsupported positioning before changing this source"
                subtable = getattr(subtable, "ExtSubTable", subtable)
                for attribute in ["Coverage", "MarkCoverage", "BaseCoverage"]:
                    coverage = getattr(subtable, attribute, None)
                    assert coverage is None or relevant.isdisjoint(coverage.glyphs), "Do not split positioned glyph clusters"
                if lookup_type == 2 and subtable.Format == 1:
                    assert not any(
                        pair.SecondGlyph in relevant
                        for pairs in subtable.PairSet for pair in pairs.PairValueRecord
                    ), "Do not split pair-positioned second glyphs"
                if lookup_type == 2 and subtable.Format == 2:
                    classes = {subtable.ClassDef2.classDefs.get(glyph, 0) for glyph in relevant}
                    assert not any(
                        value and any(vars(value).values())
                        for first in subtable.Class1Record for second in classes
                        for value in [first.Class2Record[second].Value1, first.Class2Record[second].Value2]
                    ), "Do not split nonzero class positioning"
    options = subset.Options()
    options.layout_features = ["*"]
    options.layout_scripts = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.drop_tables = []
    options.recalc_timestamp = False
    options.glyph_names = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    generated = TTFont(io.BytesIO(data), recalcTimestamp=False)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=selected)
    subsetter.subset(generated)
    retained_order = generated.getGlyphOrder()
    generated.recalcTimestamp = False
    buffer = io.BytesIO()
    generated.save(buffer)
    result = buffer.getvalue()
    verify_core(source, TTFont(io.BytesIO(result)), retained_order, selected)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", type=Path, default=DEFAULT_DIRECTORY)
    parser.add_argument("--download", action="store_true", help="Explicitly restore missing original sources")
    arguments = parser.parse_args()
    directory = arguments.directory
    manifest = json.loads((directory / "manifest.json").read_text())
    for distribution, version in manifest["generator"].items():
        assert importlib.metadata.version(distribution) == version, f"Install pinned {distribution} {version}"
    assert digest((directory / "OFL.txt").read_bytes()) == manifest["licenseSha256"]
    declared_core = set(json.loads((directory / "core-codepoints.json").read_text()))
    selection_digest = digest(",".join(f"{point:X}" for point in sorted(declared_core)).encode())
    assert selection_digest == manifest["coreSelectionSha256"], "Review shaping safety before changing the core selection"
    assigned_core = set()
    stylesheet = ["/* Generated by scripts/generate-sc-fonts.py. Original full-coverage fonts are retained under OFL-1.1. */"]
    for entry in manifest["sources"]:
        path = directory / entry["file"]
        if not path.exists() and arguments.download:
            with urlopen(entry["sourceUrl"], timeout=30) as response:
                data = response.read()
            assert digest(data) == entry["sourceSha256"]
            path.write_bytes(data)
        data = path.read_bytes()
        assert digest(data) == entry["sourceSha256"] and len(data) == entry["sourceBytes"]
        original = TTFont(io.BytesIO(data))
        entry["glyphCount"] = len(original.getGlyphOrder())
        entry["cmapCount"] = len(original.getBestCmap())
        entry["variationSequences"] = [
            {"selector": selector, "base": base, "glyphId": original.getGlyphID(glyph) if glyph else None}
            for table in original["cmap"].tables if table.format == 14
            for selector, pairs in table.uvsDict.items() for base, glyph in pairs
        ]
        source_range = codepoints(entry["unicodeRange"])
        core = set(entry.get("coreCodepoints", []))
        assert core.issubset(source_range) and assigned_core.isdisjoint(core)
        assigned_core.update(core)
        faces = [(entry["file"], source_range - core)]
        if core:
            generated = make_core(data, core)
            core_file = f"noto-sans-sc-{entry['id']}-core-{digest(generated)[:12]}.woff2"
            (directory / core_file).write_bytes(generated)
            entry["coreFile"] = core_file
            entry["coreSha256"] = digest(generated)
            entry["coreBytes"] = len(generated)
            faces.insert(0, (core_file, core))
        assert set.union(*(points for _, points in faces)) == source_range
        assert not core.intersection(source_range - core)
        for filename, points in faces:
            stylesheet.append(
                '@font-face {\n  font-family: "Noto Sans SC";\n  font-style: normal;\n'
                '  font-weight: 100 900;\n  font-display: swap;\n'
                f'  src: url("./{filename}") format("woff2");\n  unicode-range: {unicode_range(points)};\n}}'
            )
    assert assigned_core == declared_core and len(assigned_core) == 190
    fallback = manifest["fallback"]
    stylesheet.append(
        '@font-face {\n  font-family: "Noto Sans SC Fallback";\n  src: local("Arial");\n'
        f'  ascent-override: {fallback["ascentOverride"]};\n  descent-override: {fallback["descentOverride"]};\n'
        f'  line-gap-override: {fallback["lineGapOverride"]};\n  size-adjust: {fallback["sizeAdjust"]};\n}}\n'
        '.font-noto-sans-sc {\n  --font-noto-sans-sc: "Noto Sans SC", "Noto Sans SC Fallback";\n}'
    )
    (directory / "noto-sans-sc.css").write_text("\n\n".join(stylesheet) + "\n")
    (directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Verified {len(manifest['sources'])} byte-identical source fonts and {len(assigned_core)} core Han codepoints")


if __name__ == "__main__":
    main()
