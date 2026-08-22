import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { absolute: "關於｜Modern Fundamental Analyst" },
  description: "Tianyi（David）Li 的背景、投資方法，以及 Modern Fundamental Analyst 背後的理念。",
};

const disclosureFocus = [
  "投資組合持股與部位權重",
  "相對於適當基準的績效",
  "現金流與報酬計算方法",
  "股息、費用與其他相關成本",
  "重大假設與資料限制",
  "投資論點的變化與失效",
];

export default function AboutPageZhTw() {
  return <main className="about-page"><SiteHeader locale="zh-tw" counterpartPath="/about" />
    <section className="page-hero shell">
      <p className="eyebrow"><span /> 關於</p>
      <h1>公開學習。<br /><em>以證據投資。</em></h1>
      <div className="page-intro"><p>我是 Tianyi（David）Li，一名投資者，也是即將進入羅格斯大學新布朗斯維克分校榮譽學院的學生。</p><small>金融 · 商業分析與資訊科技 · 哲學</small></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>01 · 介紹</span><h2>Modern Fundamental Analyst 記錄這段過程。</h2></div>
      <div className="about-copy"><p>我計畫主修金融與商業分析及資訊科技，並同時研習哲學。我的興趣位於基本面投資、資料分析與總體經濟學的交會處。</p><p>我尤其關注企業品質、產業結構、資本配置、估值與更廣泛的經濟變化，如何共同影響長期投資結果。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>02 · 什麼是現代基本面分析師？</span><h2>傳統基礎，面對持續變化的環境。</h2></div>
      <div className="about-copy"><p>基本面分析始終是我的方法基礎：理解企業、檢視其財務狀況、評估管理層的資本配置，並比較內在價值與市場價格。</p><p>然而，企業正日益受到科技、全球資本流動、地緣政治分化與大規模經濟轉型的影響。現代基本面分析因此應結合傳統企業研究、資料與產業分析，以及對更廣泛總體經濟環境的理解。</p><p><em>Modern Fundamental Analyst</em> 這個名稱反映了這種結合。它並不代表我已完善這套方法，而是描述我正在努力成為的投資者。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>03 · 投資哲學</span><h2>集中、長期，並迎向即將到來的浪潮。</h2></div>
      <div className="about-copy about-philosophy-copy">
        <h3>集中投資</h3><p>我相信投資組合應集中於少數我真正理解並抱有信念的投資。當信念建立在研究之上，集中的投資組合能讓最強的觀點對績效產生實質影響。</p><p>集中投資同時需要紀律。每個部位都必須具備清楚的投資論點、審慎的下行風險分析，並持續檢視原始推理是否仍然成立。</p>
        <h3>長期價值投資</h3><p>在分析一檔股票時，我遵循長期價值投資原則。我會理解其背後的企業、估算長期價值，並將該價值與市場價格比較。</p><p>長期價值投資並不只是購買估值倍數較低的股票，而是投資於長期價值尚未完全反映在目前價格中的企業，並給予投資論點充分發展的時間。</p>
        <h3>即將到來的浪潮</h3><p>我相信人工智慧與其他顛覆性科技浪潮即將到來。這些科技將重塑企業、產業與整體經濟，同時創造重大機會與新的風險。</p><p>相信科技浪潮，並不代表投資每一家與其相關的公司。我仍會運用長期價值投資原則：理解企業將如何受益、是否能持續取得價值，以及該機會是否已反映在股價之中。</p>
      </div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>04 · 透明度與問責</span><h2>讓紀錄清楚到足以被誠實檢驗。</h2></div>
      <div className="about-copy"><p>我公開投資組合與績效，包括投資組合落後基準的時期。投資觀點不應只根據它聽起來多有說服力來評估，也應接受後續結果的檢驗。</p><p>公開揭露能記錄當時持有什麼、相信什麼，以及決策最終表現如何。在具備必要資訊的情況下，我希望揭露：</p><ul className="about-list">{disclosureFocus.map((item) => <li key={item}>{item}</li>)}</ul><p>目標不是呈現一份毫無瑕疵的紀錄。透明意味著區分事實與假設、解釋結論背後的推理、承認不確定性，並在更好的證據出現時修正紀錄，同時不揭露機密或私人資訊。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>05 · 研究與寫作</span><h2>把觀點轉化為可驗證的論證。</h2></div>
      <div className="about-copy"><p>這裡發布的備忘錄可能涵蓋上市公司、產業、總體經濟發展、投資組合建構或其他資產類別。無論是完整研究或簡短筆記，我都希望清楚呈現論點、證據、假設、風險，以及會促使結論改變的條件。</p><p>我的研究包括 <em>The Great Bifurcation Is Here</em>，這是一份對全球經濟與投資環境結構性變化的獨立研究。我也曾進行公開市場股票研究，協助家庭資產配置決策，其中包括一項香港住宅投資個案研究。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>06 · 背景</span><h2>建立更廣泛的分析基礎。</h2></div>
      <div className="about-copy"><p>進入大學前，我曾在香港實習，並與前主管維持良好關係。我也曾經營家教業務，提早累積客戶溝通、紀錄管理，以及對獨立收入負責的經驗。</p><p>在羅格斯大學，我計畫進一步建立金融、會計、統計、建模與資料分析方面的技術基礎。哲學則能透過強化推理、論證與檢視假設的能力，補充這些訓練。</p><p>長期而言，我希望進入跨國金融機構或投資相關組織工作，累積跨市場經驗，並持續成長為一名投資者與分析師。</p></div>
    </section>

    <section className="about-boundaries shell">
      <div><span>這個網站是</span><ul><li>一份持續演進的投資流程公開紀錄</li><li>原創研究與投資備忘錄的資料庫</li><li>投資組合績效的透明呈現</li><li>讓我的思考更有紀律、更可被檢驗的方法</li></ul></div>
      <div><span>這個網站不是</span><p>Modern Fundamental Analyst 並非投資顧問服務，網站上的任何內容都不應被理解為個人化財務建議。研究可能包含錯誤、不完整資訊，或日後證明不正確的結論。</p><p>讀者應自行進行研究，並在適當情況下諮詢具備資格的專業人士。</p></div>
    </section>

    <section className="about-closing shell">
      <p className="eyebrow"><span /> 結語</p>
      <h2>一次一篇備忘錄、一個部位，以及一次修正。</h2>
      <div><p>我預期自己的觀點會隨學習而改變。這是投資過程的一部分，而不是需要掩飾的事情。</p><p>這個網站的目的，是保存每項決策背後的推理、用結果衡量這些決策，並逐步建立一套更嚴謹的投資流程。</p><p>更詳細的法律與方法資訊，請參閱<Link href="/zh-tw/disclaimer">免責聲明</Link>與<Link href="/zh-tw/performance">績效</Link>頁面。</p></div>
    </section>
    <SiteFooter locale="zh-tw" />
  </main>;
}
