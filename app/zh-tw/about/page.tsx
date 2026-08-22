import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { absolute: "關於｜Modern Fundamental Analyst" },
  description: "Tianyi（David）Li 的背景、投資方法，以及 Modern Fundamental Analyst 背後的理念。",
};

export default function AboutPageZhTw() {
  return <main className="about-page"><SiteHeader locale="zh-tw" counterpartPath="/about" />
    <section className="page-hero shell">
      <p className="eyebrow"><span /> 關於</p>
      <h1>持續學習。<br /><em>以問責精神投資。</em></h1>
      <div className="page-intro"><p>我是 Tianyi（David）Li，即將進入羅格斯大學榮譽學院，並正在建立一套透明、長期的投資流程。</p><small>金融 · 商業分析與資訊科技 · 哲學 · 音樂</small></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>01 · 介紹</span><h2>我為何建立 Modern Fundamental Analyst</h2></div>
      <div className="about-copy"><p>Modern Fundamental Analyst 記錄我如何研究股票、評估企業價值、管理投資組合，以及檢視自己的成果。</p><p>我相信個人投資者應能取得透明的投資研究與容易理解的估值方法。透過公開投資組合、績效、財務模型與投資論點，我希望建立一份可隨時間檢驗的公開紀錄。</p><p>這個網站的使命，是幫助每一位個人投資者理解企業、質疑假設，並作出獨立的投資決策。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>02 · 什麼是現代基本面分析師？</span><h2>以傳統基本面迎接下一波科技浪潮</h2></div>
      <div className="about-copy"><p>現代基本面分析師從企業本身出發：其營運、競爭地位、財務報表、資本配置、長期機會與風險。</p><p>我重視會計作為商業語言及財務建模基礎的角色。我建立整合式三大財務報表模型，以理解損益表、資產負債表與現金流量表如何相互連動，再運用 DCF 模型評估股票的內在價值。</p><p>我也相信人工智慧與其他顛覆性科技浪潮即將到來。傳統基本面分析仍不可或缺，但必須應用於在快速變化科技環境中營運的企業。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>03 · 投資哲學</span><h2>集中投資組合，長期評估企業價值</h2></div>
      <div className="about-copy"><p>在投資組合管理上，我相信集中投資。我偏好持有少數自己真正理解並抱有信念的部位，讓最強的投資觀點能對績效產生實質貢獻。</p><p>在股票分析上，我相信長期價值投資。我研究企業、建立財務預測、評估其內在價值，並將該價值與市場價格比較。只要企業持續按照預期發展，而且原始投資論點仍然成立，我願意長期持有股票。</p><p>我也尋找有望受益於人工智慧與其他顛覆性科技的企業。然而，強大的趨勢並不會自動使每一檔相關股票成為良好投資；企業品質、估值與風險仍然重要。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>04 · 透明度與問責</span><h2>讓每項投資決策接受公開檢視</h2></div>
      <div className="about-copy"><p>我透過每月完整揭露投資組合與績效，並發布詳細投資論點，推動透明度與問責。</p><p>每月揭露建立了一份我持有什麼、以及決策表現如何的公開紀錄。我的投資論點會說明為何持有每一檔股票、我認為它價值多少、市場可能忽略了什麼，以及什麼因素會使我的觀點改變。</p><p>目標不是呈現一份毫無瑕疵的紀錄，而是讓我的推理與結果清楚到足以被誠實評估，包括錯誤、論點變化與績效落後的時期。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>05 · 研究與寫作</span><h2>把投資觀點轉化為可驗證的論點</h2></div>
      <div className="about-copy"><p>我運用投資備忘錄，將觀點轉化為有結構且可驗證的論證。每項投資論點都力求說明企業、投資機會、支持證據、估值、主要風險，以及會使我改變觀點的條件。</p><p>在適當情況下，我會以整合式三大財務報表模型與 DCF 估值支持研究。模型將營運假設與財務表現及內在價值連結起來。</p><p>在結果出現前發布投資論點，能留下當時的公開紀錄。讀者可以檢視我的假設、不同意我的結論，並隨新證據出現而獨立評估每一項觀點。</p></div>
    </section>

    <section className="about-section shell">
      <div className="about-section-heading"><span>06 · 背景</span><h2>以好奇心、同理心與持續學習成長</h2></div>
      <div className="about-copy"><p>我即將進入羅格斯大學新布朗斯維克分校榮譽學院，計畫雙主修金融與商業分析及資訊科技，並考慮輔修哲學或音樂。</p><p>我提倡以好奇心、同理心與持續學習為基礎的「learn-it-all」成長思維。我不期待自己一開始就擁有所有答案，而是希望提出更好的問題、聆聽不同觀點、接受回饋，並持續提升知識與能力。</p><p>這種思維也塑造了我的投資方式。當證據挑戰既有觀點時，我寧願重新檢視並修正投資論點，也不會只為了維持一致而捍衛先前的結論。</p></div>
    </section>

    <section className="about-boundaries shell">
      <div><span>這個網站是</span><ul><li>每月完整揭露的投資組合與績效紀錄</li><li>詳細投資論點與財務模型的資料庫</li><li>為幫助每一位個人投資者而建立的資源</li></ul></div>
      <div><span>這個網站不是</span><ul><li>對每項投資論點都會正確的承諾</li><li>買入或賣出任何特定證券的建議</li><li>獨立研究或專業財務建議的替代品</li></ul></div>
    </section>

    <section className="about-closing shell">
      <p className="eyebrow"><span /> 結語</p>
      <h2>公開學習，獨立思考，持續進步</h2>
      <div><p>我相信公開學習、透明投資，並幫助他人獨立思考。</p><p>我不期待自己擁有所有答案。我希望保持好奇、以同理心面對不同觀點、清楚說明自己的假設，並在證據改變時修正結論。</p><p>Modern Fundamental Analyst 保存我每項投資決策背後的推理，並以結果衡量這些決策。透過每月揭露投資組合與績效、發布詳細投資論點與透明的估值方法，我希望建立更嚴謹的投資流程，同時幫助每一位個人投資者發展自己的判斷。</p><p>更詳細的法律與方法資訊，請參閱<Link href="/zh-tw/disclaimer">免責聲明</Link>與<Link href="/zh-tw/performance">績效</Link>頁面。</p></div>
    </section>
    <SiteFooter locale="zh-tw" />
  </main>;
}
