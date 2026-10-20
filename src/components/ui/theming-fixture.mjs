import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Table, TableBody, TableRow, TableCell, TableFooter } from "./table";
import { CardFooter } from "./card";
import { AlertDialogFooter } from "./alert-dialog";

import { Toast, ToastProvider, ToastViewport } from "./toast";
const markup = renderToStaticMarkup(
  h(
    "section",
    { id: "token-fixture" },
    h(
      Table,
      null,
      h(TableBody, null, h(TableRow, null, h(TableCell, null, "Value"))),
      h(TableFooter, null, h(TableRow, null, h(TableCell, null, "Total"))),
    ),
    h(ToastProvider, null, h(ToastViewport, null, h(Toast, { toast: { id: "fixture" } }, "Saved"))),
    h(CardFooter, null, "Card footer"),
    h(AlertDialogFooter, null, "Dialog footer"),
  ),
);

console.log(markup);
