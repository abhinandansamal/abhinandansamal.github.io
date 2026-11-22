import { html, render, Component } from './preact-htm.mjs';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { section: null, lang: 'en', step: 0, cap: 0, filter: 'all', project: 'recall', open: {}, stackTab: 0 };
  }
  componentDidMount() {
    this._targets = this._targets || {};
    this._sec = { storyH2: 'story', chTitle: 'story', chBody: 'story', tagline: 'moment', bringH2: 'bring', capProof: 'bring', workH2: 'work', resH2: 'research', stackH2: 'stack', certH2: 'certs', recsH2: 'recs', contactH2: 'contact' };
    this._speed = { chBody: 6, capProof: 5 };
    this._ids = ['story', 'moment', 'work', 'research', 'stack', 'bring', 'certs', 'recs', 'contact', 'numbers'];
    this._spyMap = { story: 'story', moment: 'story', bring: 'bring', work: 'work', research: 'research', stack: 'stack', certs: 'certs', recs: 'recs', contact: 'contact' };
    this._live = false;
    try {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const vh = window.innerHeight || 800;
      const armed = {};
      this._ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top > vh * 0.85) armed[id] = true; });
      this._live = !reduce && Object.keys(armed).length > 0;
      if (this._live) {
        const typed = { h1b: 0 };
        Object.keys(this._sec).forEach((k) => { if (armed[this._sec[k]]) typed[k] = 0; });
        this.setState({ armed: armed, typed: typed, count: { all: 0 }, seen: {} });
        this._timer = setInterval(() => this._tick(), 28);
      }
      this._onScroll = () => {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => { this._raf = null; this._spy(); });
      };
      document.addEventListener('scroll', this._onScroll, true);
      window.addEventListener('resize', this._onScroll);
      setTimeout(() => this._spy(), 60);
    } catch (err) {}
  }
  componentWillUnmount() {
    try { document.removeEventListener('scroll', this._onScroll, true); window.removeEventListener('resize', this._onScroll); } catch (err) {}
    if (this._timer) clearInterval(this._timer);
  }
  _spy() {
    const vh = window.innerHeight || 800;
    let active = null;
    const seen = Object.assign({}, this.state.seen || {});
    let changed = false;
    this._ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (this._spyMap[id] && r.top <= vh * 0.3 && r.bottom > vh * 0.3) active = this._spyMap[id];
      if (!seen[id] && r.top < vh * 0.8) { seen[id] = true; changed = true; }
    });
    const se = document.scrollingElement || document.documentElement;
    if (se && se.scrollHeight > vh + 50 && se.scrollTop + vh >= se.scrollHeight - 4) active = 'contact';
    const upd = {};
    if (active !== this.state.section && !(this._lockUntil && Date.now() < this._lockUntil)) upd.section = active;
    if (changed) upd.seen = seen;
    if (Object.keys(upd).length) this.setState(upd);
  }
  _tick() {
    const st = this.state;
    const seen = st.seen || {};
    const typed = Object.assign({}, st.typed || {});
    let changed = false;
    Object.keys(typed).forEach((k) => {
      const target = this._targets[k] || 0;
      const sec = this._sec[k];
      if (typed[k] < target && (!sec || seen[sec])) { typed[k] = Math.min(target, typed[k] + (this._speed[k] || 2)); changed = true; }
    });
    const upd = {};
    if (changed) upd.typed = typed;
    const c = (st.count || {}).all;
    if (c !== undefined && c < 1 && seen.numbers) { upd.count = { all: Math.min(1, c + 0.035) }; }
    if (Object.keys(upd).length) this.setState(upd);
  }
  retype(keys) {
    if (!this._live) return {};
    const typed = Object.assign({}, this.state.typed || {});
    keys.forEach((k) => { typed[k] = 0; });
    return { typed: typed };
  }
  renderVals() {
    const st = this.state;
    const de = st.lang === 'de';
    const L = (en, d) => (de ? d : en);
    if (!this._targets) this._targets = {};
    const typedS = st.typed || {};
    const T = (k, text) => {
      this._targets[k] = text.length;
      const has = Object.prototype.hasOwnProperty.call(typedS, k);
      const n = has ? Math.min(typedS[k], text.length) : text.length;
      return { typed: text.slice(0, n), rest: text.slice(n), typing: has && n < text.length };
    };
    const armed = st.armed || {}, seenS = st.seen || {};
    const stg = {};
    ['story', 'bring', 'work', 'stack', 'certs', 'numbers', 'recs'].forEach((k) => { stg[k] = armed[k] ? (seenS[k] ? 'stagger go' : 'stagger') : ''; });

    const t = {
      navStory: L('Story', 'Werdegang'), navCaps: L('Capabilities', 'Kompetenzen'), navWork: L('Work', 'Projekte'), navResearch: L('Research', 'Forschung'), navStack: L('Stack', 'Tech-Stack'), navCerts: L('Certifications', 'Zertifikate'), navContact: L('Contact', 'Kontakt'),
      cv: L('CV (PDF)', 'Lebenslauf (PDF)'),
      hello: L('Hi, I’m', 'Hallo, ich bin'),
      h1b: L('I turn LLM research into AI systems that hold up in production.', 'Ich mache aus LLM-Forschung KI-Systeme, die im Produktivbetrieb bestehen.'),
      heroP: L('Based in Berlin. During my M.Sc. in Data Science I fine-tuned and evaluated LLMs, co-authored two peer-reviewed papers and built multi-agent systems with evaluation, tracing and infrastructure as code. Before that, 6 years of data and ML engineering at TCS and IBM taught me to build for production, not for demos.', 'Mit Sitz in Berlin. Im M.Sc. Data Science habe ich LLMs feinabgestimmt und evaluiert, zwei begutachtete Paper mitverfasst und Multi-Agenten-Systeme mit Evaluation, Tracing und Infrastructure as Code gebaut. Davor haben mich 6 Jahre Data und ML Engineering bei TCS und IBM gelehrt, für den Produktivbetrieb zu bauen – nicht für Demos.'),
      btnSystems: L('View systems', 'Projekte ansehen'), btnEmail: L('Email me', 'E-Mail schreiben'),
      avail: L('Available now', 'Sofort verfügbar'),
      permitL: L('Work permit:', 'Arbeitserlaubnis:'), permitV: L('Job Seeker Visa Holder (§20 AufenthG) · Unrestricted Work Rights', 'Aufenthaltserlaubnis zur Arbeitsplatzsuche (§20 AufenthG) · Uneingeschränkt'),
      locL: L('Based in Berlin ·', 'Wohnort Berlin ·'), locV: L('Open to Relocation, On-site, Hybrid or Remote', 'Umzugsbereit, vor Ort, hybrid oder remote'),
      langL: L('Languages:', 'Sprachen:'), langV: L('English C1 · German A1 → A2', 'Englisch C1 · Deutsch A1 → A2'),
      storyEyebrow: L('THE STORY', 'MEIN WEG'),
      storyH2: L('From production engineering to AI engineering.', 'Vom Production Engineering zum AI Engineering.'),
      prev: L('← Previous', '← Zurück'), next: L('Next chapter →', 'Nächstes Kapitel →'),
      cap1: L('Graduation day · M.Sc. Data Science, IU International University of Applied Sciences', 'Abschlussfeier · M.Sc. Data Science, IU International University of Applied Sciences'),
      cap2: L('Celebrating with the class of 2025 · Berlin', 'Feier mit dem Abschlussjahrgang 2025 · Berlin'),
      tagline: L('Research rigour, production discipline: I build LLM systems you can measure, afford and run.', 'Forschungsgenauigkeit, Produktionsdisziplin: Ich baue LLM-Systeme, die messbar, bezahlbar und betreibbar sind.'),
      tagSub: L('Learned in Berlin: making small models beat large ones, evaluating with significance tests, and keeping humans in the agent loop. Delivered with evals, tracing and infrastructure as code.', 'Gelernt in Berlin: kleine Modelle besser machen als große, mit Signifikanztests evaluieren und Menschen im Agenten-Loop halten. Geliefert mit Evals, Tracing und Infrastructure as Code.'),
      bringEyebrow: L('WHAT I BRING TO AN AI TEAM', 'WAS ICH IN EIN AI-TEAM EINBRINGE'),
      bringH2: L('Nine capabilities, each with proof attached.', 'Neun Kompetenzen – jede mit Nachweis.'),
      where: L('WHERE YOU CAN SEE IT', 'WO SIE ES SEHEN'),
      workEyebrow: L('SELECTED WORK', 'AUSGEWÄHLTE PROJEKTE'),
      workH2: L('Pick a system. See how it works.', 'System wählen. Funktionsweise sehen.'),
      videoNote: L('YouTube · loads when you press play', 'YouTube · lädt erst beim Abspielen'),
      download: L('Download PDF', 'PDF herunterladen'),
      problem: L('Problem', 'Problem'), approach: L('Approach', 'Ansatz'),
      resEyebrow: L('RESEARCH & PUBLICATIONS', 'FORSCHUNG & PUBLIKATIONEN'),
      resH2: L('A 600M model that outscored GPT-5, Gemini and Claude translating German into Odia.', 'Ein 600M-Modell, das GPT-5, Gemini und Claude bei der Übersetzung von Deutsch ins Odia übertrifft.'),
      benchCap: L('Benchmark on the held-out test set · best value per metric highlighted · TER: lower is better', 'Benchmark auf dem Held-out-Testset · bester Wert je Metrik hervorgehoben · TER: niedriger ist besser'), benchModel: L('Model', 'Modell'), benchNote: L('Honest read: from German into Odia, the specialist leads on BLEU, chrF++ and TER. From Odia into German, Gemini 2.5 Pro and Claude Sonnet 4.5 lead, while the 600M model still edges past GPT-5 on BLEU and beats it on TER, at a fraction of the inference cost.', 'Ehrlich betrachtet: Von Deutsch ins Odia führt der Spezialist bei BLEU, chrF++ und TER. Von Odia ins Deutsche liegen Gemini 2.5 Pro und Claude Sonnet 4.5 vorn, während das 600M-Modell GPT-5 beim BLEU knapp überholt und beim TER schlägt – zu einem Bruchteil der Inferenzkosten.'),
      resNote: L('Both papers are accepted and presented; the proceedings are not public yet. Until they are, the camera-ready paper, the slides and the conference certificates are attached here as proof.', 'Beide Paper sind angenommen und präsentiert; der Tagungsband ist noch nicht öffentlich. Bis dahin dienen das Camera-Ready-Paper, die Folien und die Konferenzzertifikate hier als Nachweis.'),
      resStatus: L('Accepted · presented · publication pending', 'Angenommen · präsentiert · Veröffentlichung ausstehend'),
      proofCert: L('Presentation certificate', 'Präsentationszertifikat'), proofCertSub: L('PDF · issued by the conference', 'PDF · ausgestellt von der Konferenz'),
      proofSlides: L('Presentation slides', 'Präsentationsfolien'), proofSlidesSub: L('PDF · as presented', 'PDF · wie präsentiert'),
      proofPaper: L('Full paper', 'Vollständiges Paper'), proofPaperSub: L('Accepted manuscript · on request', 'Angenommenes Manuskript · auf Anfrage'),
      stackEyebrow: L('TECH STACK', 'TECH-STACK'), stackH2: L('Tools I use in practice.', 'Werkzeuge, die ich in der Praxis einsetze.'),
      certEyebrow: L('CERTIFICATIONS', 'ZERTIFIKATE'), certH2: L('Verified credentials.', 'Verifizierte Nachweise.'), verify: L('Verify credential', 'Nachweis prüfen'),
      contactH2: L('Building AI products or the data platforms behind them? Let’s talk.', 'Sie bauen KI-Produkte oder die Datenplattformen dahinter? Sprechen wir.'),
      contactP: L('Open to AI Engineer, ML Engineer, Data Engineer and Applied AI Research roles. Available immediately with unrestricted German work rights, and happy to walk you through any system live. I usually reply within 24 hours.', 'Offen für Rollen als AI Engineer, ML Engineer, Data Engineer und im Applied AI Research. Sofort verfügbar mit uneingeschränkter Arbeitserlaubnis in Deutschland – gern stelle ich jedes System live vor. Antwort in der Regel innerhalb von 24 Stunden.'),
      building: L('Currently building: Recall Radar · v1.0 late Nov 2026', 'Aktuell in Arbeit: Recall Radar · v1.0 Ende Nov. 2026'),
      footer: L('© 2026 Abhinandan Samal · Berlin · no cookies, no trackers', '© 2026 Abhinandan Samal · Berlin · keine Cookies, kein Tracking'),
      privacy: L('Privacy policy', 'Datenschutz'),
      codeModels: L('CODE, MODELS & DATA', 'CODE, MODELLE & DATEN'),
      navRecs: L('Recommendations', 'Empfehlungen'),
      recsEyebrow: L('RECOMMENDATIONS', 'EMPFEHLUNGEN'), recsH2: L('What people I’ve worked with say.', 'Was Kolleginnen und Kollegen sagen.'), recsMore: L('Read all recommendations on LinkedIn', 'Alle Empfehlungen auf LinkedIn lesen'), recsNote: L('Quoted from LinkedIn recommendations, shortened.', 'Zitiert aus LinkedIn-Empfehlungen, gekürzt; im englischen Original.'),
      insideMsc: L('Inside the M.Sc.:', 'Im M.Sc.:'),
      viewOpen: L('Open', 'Öffnen'), viewClose: L('Close', 'Schließen'),
      pendingH_unused: L('Paper PDF coming soon', 'Paper-PDF folgt in Kürze'),
      pendingP: L('The accepted ICICoS 2026 manuscript will be added here. Until the IEEE proceedings are public, I am happy to share a copy on request.', 'Das angenommene ICICoS-2026-Manuskript wird hier ergänzt. Bis der IEEE-Tagungsband öffentlich ist, sende ich gern eine Kopie auf Anfrage.'),
      pendingBtn: L('Request the paper', 'Paper anfragen')
    };

    const NAV = [ { id: 'story', label: t.navStory }, { id: 'work', label: t.navWork }, { id: 'research', label: t.navResearch }, { id: 'stack', label: t.navStack }, { id: 'bring', label: t.navCaps }, { id: 'certs', label: t.navCerts }, { id: 'recs', label: t.navRecs }, { id: 'contact', label: t.navContact } ];
    const nav = NAV.map((n) => ({ label: n.label, href: '#' + n.id, active: n.id === st.section, inactive: n.id !== st.section, pick: () => { this._lockUntil = Date.now() + 900; this.setState({ section: n.id }); } }));
    const langs = [ { id: 'en', label: 'EN' }, { id: 'de', label: 'DE' } ].map((l) => ({ label: l.label, active: l.id === st.lang, inactive: l.id !== st.lang, pick: () => { try { document.documentElement.lang = l.id; } catch (e) {} this.setState({ lang: l.id, typed: {} }); } }));

    const CH = [
      { tab: L('2017–23 · Industry', '2017–23 · Industrie'), kicker: L('Prologue · Industry', 'Prolog · Industrie'), subLabel: L('Inside the 6 years:', 'In den 6 Jahren:'), subs: [
        { sub: L('Overview', 'Überblick'), years: '2017 – 2023', org: L('TCS and IBM · 6 years in industry', 'TCS und IBM · 6 Jahre Industrie'), title: L('The production foundation', 'Das Produktionsfundament'), body: L('Six years across telecom, financial services, retail banking and insurance: Data Analyst, Big Data Engineer and Machine Learning Engineer at TCS, then Cloud Data Engineer at IBM. The constant: systems that run every day for real clients, with SLAs, data-protection rules and production incidents to handle.', 'Sechs Jahre in Telekommunikation, Finanzdienstleistung, Retail-Banking und Versicherung: Data Analyst, Big Data Engineer und Machine Learning Engineer bei TCS, danach Cloud Data Engineer bei IBM. Die Konstante: Systeme, die täglich für echte Kunden laufen, mit SLAs, Datenschutzvorgaben und echten Produktionsvorfällen.'), wins: [ { n: L('13M customers', '13 Mio. Kunden'), l: L('served by a recommender I built · +15% cross-sell, +9% up-sell', 'bedient von einem Empfehlungssystem, das ich gebaut habe · +15 % Cross-Selling, +9 % Up-Selling') }, { n: L('>90% recall', '>90 % Recall'), l: L('churn model in production with automated retraining', 'Churn-Modell in Produktion mit automatisiertem Retraining') }, { n: '−30%', l: L('error-processing time in real-time Kafka pipelines', 'Fehlerverarbeitungszeit in Echtzeit-Kafka-Pipelines') } ] },
        { sub: L('2017–18 · Data Analyst', '2017–18 · Data Analyst'), years: L('Feb 2017 – Mar 2018', 'Feb. 2017 – März 2018'), org: L('Data Analyst · TCS · Hyderabad, India', 'Data Analyst · TCS · Hyderabad, Indien'), client: L('Client: Telecom, India', 'Kunde: Telekommunikation, Indien'), title: L('Learning the data, and the client', 'Die Daten verstehen – und den Kunden'), body: L('Primary point of contact for client queries and escalations. Migrated the client’s databases by rewriting connection scripts, kept monthly reporting running throughout, built Power BI dashboards, and automated data extraction and reporting with UNIX shell scripts and PL/SQL.', 'Erster Ansprechpartner für Kundenanfragen und Eskalationen. Datenbanken des Kunden migriert und Verbindungsskripte angepasst, die monatliche Berichterstattung dabei ohne Unterbrechung weitergeführt, Power-BI-Dashboards gebaut und Datenextraktion sowie Reporting mit UNIX-Shell-Skripten und PL/SQL automatisiert.'), wins: [ { n: L('100% in SLA', '100 % im SLA'), l: L('client escalations and queries resolved', 'Kundeneskalationen und Anfragen gelöst') }, { n: L('0 disruptions', '0 Ausfälle'), l: L('in reporting during the database migration', 'im Reporting während der Datenbankmigration') }, { n: L('~12 → <3 h', '~12 → <3 Std.'), l: L('manual reporting per week after automation', 'manuelles Reporting pro Woche nach Automatisierung') } ], tools: ['PL/SQL', 'UNIX shell', 'SQL Developer', 'Toad', 'Power BI', 'MS Excel'] },
        { sub: L('2018–20 · Big Data Engineer', '2018–20 · Big Data Engineer'), years: L('Apr 2018 – May 2020', 'Apr. 2018 – Mai 2020'), org: L('Big Data Engineer · TCS · Bhubaneswar, India', 'Big Data Engineer · TCS · Bhubaneswar, Indien'), client: L('Client: Financial Services, UK', 'Kunde: Finanzdienstleistung, Großbritannien'), title: L('Building the pipelines', 'Die Pipelines bauen'), body: L('Designed and coded custom batch and real-time ETL pipelines for financial applications and tested them end to end. Introduced HBase and PostgreSQL as real-time sinks and a config-driven handler that routes failed records to HDFS or local storage, so bad data is kept for reprocessing instead of lost. Led a PySpark proof of concept that sped up both batch and streaming workloads and presented it to senior management.', 'Individuelle Batch- und Echtzeit-ETL-Pipelines für Finanzanwendungen entworfen, entwickelt und durchgängig getestet. HBase und PostgreSQL als Echtzeit-Senken eingeführt sowie einen konfigurierbaren Handler, der fehlerhafte Datensätze in HDFS oder lokal ablegt – sie bleiben für die Nachverarbeitung erhalten statt verloren zu gehen. Einen PySpark-Proof-of-Concept geleitet, der Batch- und Streaming-Workloads beschleunigte, und ihn dem Senior Management präsentiert.'), wins: [ { n: L('~1.5 TB/day', '~1,5 TB/Tag'), l: L('batch and real-time data processed', 'Batch- und Echtzeitdaten verarbeitet') }, { n: L('6 h → <2 h', '6 Std. → <2 Std.'), l: L('nightly batch after the PySpark migration (3× throughput)', 'nächtlicher Batch nach PySpark-Migration (3× Durchsatz)') } ], tools: ['Java', 'Python', 'PySpark', 'Kafka', 'Hadoop (HDFS, Hive, HBase)', 'PostgreSQL'] },
        { sub: L('2020–22 · ML Engineer', '2020–22 · ML Engineer'), years: L('Jun 2020 – Jun 2022', 'Juni 2020 – Juni 2022'), org: L('Machine Learning Engineer · TCS · Bhubaneswar, India', 'Machine Learning Engineer · TCS · Bhubaneswar, Indien'), client: L('Client: Retail Bank, UK', 'Kunde: Retail-Bank, Großbritannien'), title: L('First models in production', 'Erste Modelle in Produktion'), body: L('Two production ML systems for a bank, from stakeholder workshops on which attributes to use and how to encrypt personal data, to deployment on AWS EMR and Kubernetes with monitoring dashboards.', 'Zwei produktive ML-Systeme für eine Bank – von Stakeholder-Workshops zu Attributen und Verschlüsselung personenbezogener Daten bis zum Deployment auf AWS EMR und Kubernetes mit Monitoring-Dashboards.'), wins: [ { n: L('13M customers', '13 Mio. Kunden'), l: L('scored by the event-detection and offer pipeline', 'bewertet von der Event-Erkennungs- und Angebots-Pipeline') }, { n: '+15% / +9%', l: L('cross-sell / up-sell from targeted offers', 'Cross-Selling / Up-Selling durch gezielte Angebote') }, { n: L('>90% recall', '>90 % Recall'), l: L('churn model, retrained automatically', 'Churn-Modell, automatisch nachtrainiert') } ],
          projects: [
            { name: L('Customer churn prediction', 'Vorhersage von Kundenabwanderung'), when: L('Retail bank', 'Retail-Bank'), what: L('Logistic Regression, Random Forest and LightGBM, tuned for recall so fewer at-risk customers are missed. Deployed with dashboards and automatic retraining every 6 months, or as soon as recall drops below 90%.', 'Logistic Regression, Random Forest und LightGBM, auf Recall optimiert, damit weniger abwanderungsgefährdete Kunden übersehen werden. Deployment mit Dashboards und automatischem Retraining alle 6 Monate oder sobald der Recall unter 90 % fällt.'), metric: L('Recall consistently above 90%', 'Recall konstant über 90 %') },
            { name: L('Event-driven offer recommender', 'Ereignisbasierte Angebotsempfehlung'), when: L('Retail bank · 13M customers', 'Retail-Bank · 13 Mio. Kunden'), what: L('Detected unusual transactions (IQR) and spending trends (Mann-Kendall test), then recommended offers with a hybrid CMFRec model: collaborative filtering for existing customers, content-based filtering for new ones.', 'Auffällige Transaktionen (IQR) und Ausgabetrends (Mann-Kendall-Test) erkannt und Angebote mit einem hybriden CMFRec-Modell empfohlen: Collaborative Filtering für Bestandskunden, Content-based Filtering für Neukunden.'), metric: L('+15% cross-sell · +9% up-sell', '+15 % Cross-Selling · +9 % Up-Selling') }
          ], tools: ['Python', 'SQL', 'scikit-learn', 'LightGBM', 'CMFRec', 'AWS EMR', 'Kubernetes', 'Tableau'] },
        { sub: L('2022–23 · Cloud Data Engineer', '2022–23 · Cloud Data Engineer'), years: L('Jul 2022 – Jun 2023', 'Juli 2022 – Juni 2023'), org: L('Cloud Data Engineer · IBM · Hyderabad, India', 'Cloud Data Engineer · IBM · Hyderabad, Indien'), client: L('Client: Life Insurance, New Zealand', 'Kunde: Lebensversicherung, Neuseeland'), title: L('Real-time data at cloud scale', 'Echtzeitdaten im Cloud-Maßstab'), body: L('For a New Zealand life insurer, built the real-time layer that captures, processes and stores JSON and AVRO events for business analytics. Wrote 50+ ksqlDB objects on Confluent Cloud for flat and deeply nested data, and a Kafka deserialization solution that made error handling faster and more reliable. Kafka topics are defined as code with Terraform, and Azure DevOps pipelines deploy automatically to sandbox, test and dev. Led the Kafka–ksqlDB work within a 22+ member offshore team and worked with senior architects and the client to finalise the pipeline design.', 'Für einen neuseeländischen Lebensversicherer die Echtzeitschicht gebaut, die JSON- und AVRO-Events für Business Analytics erfasst, verarbeitet und speichert. Über 50 ksqlDB-Objekte auf Confluent Cloud für flache und tief verschachtelte Daten entwickelt sowie eine Kafka-Deserialisierungslösung, die die Fehlerbehandlung schneller und zuverlässiger macht. Kafka-Topics sind per Terraform als Code definiert; Azure-DevOps-Pipelines deployen automatisch nach Sandbox, Test und Dev. Den Kafka–ksqlDB-Bereich in einem Offshore-Team mit 22+ Personen geleitet und mit Senior-Architekten und dem Kunden das finale Pipeline-Design erarbeitet.'), wins: [ { n: L('Team lead', 'Teamleitung'), l: L('Kafka–ksqlDB stream in a 22+ member offshore team', 'Kafka–ksqlDB-Bereich in einem Offshore-Team mit 22+ Personen') }, { n: '50+', l: L('ksqlDB objects for nested JSON and AVRO events', 'ksqlDB-Objekte für verschachtelte JSON- und AVRO-Events') }, { n: '−30%', l: L('error-processing time via Kafka deserialization', 'Fehlerverarbeitungszeit durch Kafka-Deserialisierung') }, { n: L('2 days → 30 min', '2 Tage → 30 Min.'), l: L('environment provisioning with Terraform and CI/CD', 'Umgebungs-Provisionierung mit Terraform und CI/CD') } ], tools: ['Confluent Cloud', 'ksqlDB', 'Kafka', 'Terraform', 'Azure DevOps'] }
      ] },
      { tab: L('2023–25 · M.Sc. Berlin', '2023–25 · M.Sc. Berlin'), kicker: L('Chapter 01 · M.Sc.', 'Kapitel 01 · M.Sc.'), subLabel: L('Inside the M.Sc.:', 'Im M.Sc.:'), subs: [
        { sub: L('Overview', 'Überblick'), years: L('Jul 2023 – Nov 2025', 'Juli 2023 – Nov. 2025'), org: L('M.Sc. Data Science · IU International University of Applied Sciences · Berlin', 'M.Sc. Data Science · IU International University of Applied Sciences · Berlin'), title: L('Starting over, on purpose', 'Bewusster Neustart'), body: L('Moved to Germany for a full-time M.Sc. in Data Science focused on ML systems and generative AI, to add modelling and research depth to six years of data engineering. Inside the degree: three industry-simulation ML projects and a research thesis on low-resource machine translation, each built on a data pipeline I designed myself, because model quality starts with data preparation.', 'Umzug nach Deutschland für einen Vollzeit-M.Sc. Data Science mit Schwerpunkt ML-Systeme und generative KI – um sechs Jahre Data Engineering um Tiefe in Modellierung und Forschung zu ergänzen. Teil des Studiums: drei Industrie-Simulationsprojekte im Bereich ML und eine Forschungsarbeit zu maschineller Übersetzung für ressourcenarme Sprachen, jeweils auf einer selbst entworfenen Datenpipeline – denn Modellqualität beginnt bei der Datenaufbereitung.'), wins: [ { n: L('Grade 1.9', 'Note 1,9'), l: L('M.Sc. Data Science, completed Nov 2025', 'M.Sc. Data Science, abgeschlossen Nov. 2025') }, { n: L('3 projects + thesis', '3 Projekte + Masterarbeit'), l: L('applied ML and research, all part of the degree', 'angewandtes ML und Forschung, alles Teil des Studiums') } ] },
        { sub: L('Applied ML projects', 'Angewandte ML-Projekte'), tab: L('2024–25 · Applied ML', '2024–25 · Angewandtes ML'), kicker: L('Chapter 02', 'Kapitel 02'), years: L('Aug 2024 – Apr 2025', 'Aug. 2024 – Apr. 2025'), org: L('Applied ML Engineer · three industry-simulation projects, part of the M.Sc.', 'Applied ML Engineer · drei Industrie-Simulationsprojekte im Rahmen des M.Sc.'), title: L('Three industries, one discipline: CRISP-DM end to end', 'Drei Branchen, eine Methode: CRISP-DM durchgängig'), body: L('Banking, payments and manufacturing problems taken from raw data to a deployable model: data-quality work, feature engineering, class-imbalance handling, tuned models judged on the right metrics, explainability and an app or API on top.', 'Probleme aus Banking, Payments und Fertigung – von Rohdaten bis zum einsatzfähigen Modell: Datenqualität, Feature Engineering, Umgang mit Klassenungleichgewicht, getunte Modelle mit passenden Metriken, Erklärbarkeit und eine App oder API obendrauf.'), wins: [ { n: L('3 projects', '3 Projekte'), l: L('banking, payments, manufacturing', 'Banking, Payments, Fertigung') }, { n: '+7 pp', l: L('payment authorisation success', 'Autorisierungsrate bei Zahlungen') }, { n: 'R² 0.71', l: L('defect-rate prediction on unseen data', 'Fehlerraten-Prognose auf ungesehenen Daten') } ],
        projects: [
          { name: L('Focused Digital Marketing in Banking', 'Fokussiertes Digital-Marketing im Banking'), when: L('Aug – Nov 2024', 'Aug. – Nov. 2024'), what: L('Predicted which liability customers convert to asset customers. Compared 5 classifiers (Logistic Regression, Naive Bayes, SVM, Decision Tree, Random Forest), handled imbalance with SMOTE, undersampling and class weights, and judged on Precision, Recall, AUC and F1, not accuracy.', 'Vorhersage, welche Einlagenkunden zu Kreditkunden werden. 5 Klassifikatoren verglichen (Logistic Regression, Naive Bayes, SVM, Decision Tree, Random Forest), Ungleichgewicht mit SMOTE, Undersampling und Klassengewichten behandelt, bewertet nach Precision, Recall, AUC und F1 statt Accuracy.'), metric: L('Random Forest selected · tuned with GridSearchCV', 'Random Forest gewählt · mit GridSearchCV getunt'), gh: 'https://github.com/abhinandansamal/Focused_Digital_Marketing_in_Banking_Sector' },
          { name: L('Credit Card Routing for Online Purchase', 'Kreditkarten-Routing für Online-Käufe'), when: L('Dec 2024 – Feb 2025', 'Dez. 2024 – Feb. 2025'), what: L('Automated Payment Service Provider selection to raise success rates and cut fees. 50,000+ transactions, SelectKBest, SMOTE, Random Forest and LightGBM with RandomizedSearchCV, permutation importance, and a Streamlit app with single- and multi-attempt routing.', 'Automatisierte Auswahl des Payment Service Providers für höhere Erfolgsquoten und geringere Gebühren. 50.000+ Transaktionen, SelectKBest, SMOTE, Random Forest und LightGBM mit RandomizedSearchCV, Permutation Importance und eine Streamlit-App mit Ein- und Mehrfachversuch-Routing.'), metric: L('+7 pp success vs rule-based routing', '+7 Pp. Erfolgsquote ggü. regelbasiertem Routing'), gh: 'https://github.com/abhinandansamal/Credit_Card_Routing_For_Online_Purchase' },
          { name: L('Smartphone Plastic Surface Manufacturing', 'Fertigung von Smartphone-Kunststoffoberflächen'), when: L('Mar – Apr 2025', 'März – Apr. 2025'), what: L('Reframed output prediction as defect-rate prediction on 4,000+ production records. Engineered Process Stress Index and Energy per Unit, compared Ridge, Random Forest and Gradient Boosting, and shipped a Flask + Docker + Streamlit tool for live what-if analysis.', 'Produktionsprognose zur Fehlerraten-Prognose umformuliert, auf 4.000+ Produktionsdatensätzen. Process Stress Index und Energy per Unit entwickelt, Ridge, Random Forest und Gradient Boosting verglichen und ein Flask- + Docker- + Streamlit-Tool für Live-Szenarioanalysen bereitgestellt.'), metric: L('R² 0.71 · top defect drivers identified', 'R² 0,71 · wichtigste Fehlertreiber identifiziert'), gh: 'https://github.com/abhinandansamal/Data_Driven_Optimization_of_Smartphone_Plastic_Surface_Manufacturing' }
        ] },
        { sub: L('Master’s thesis', 'Masterarbeit'), tab: L('2025 · Thesis', '2025 · Masterarbeit'), kicker: L('Chapter 03', 'Kapitel 03'), years: L('May – Nov 2025', 'Mai – Nov. 2025'), org: L('ML Researcher · Master’s thesis, part of the M.Sc.', 'ML Researcher · Masterarbeit im Rahmen des M.Sc.'), title: L('Teaching a model a language it barely knew', 'Einem Modell eine Sprache beibringen, die es kaum kannte'), body: L('Built a leakage-free bidirectional corpus of 7,300+ Odia–German pairs with web scraping, Unicode-aware preprocessing and human-in-the-loop validation. Fine-tuned NLLB-200 (600M) with LoRA/QLoRA on a single 16 GB GPU and benchmarked zero-shot, full fine-tuning and PEFT with BLEU, chrF++ and TER plus qualitative error analysis.', 'Leckagefreies bidirektionales Korpus mit 7.300+ Odia–Deutsch-Paaren per Web-Scraping, Unicode-bewusster Vorverarbeitung und Human-in-the-Loop-Validierung erstellt. NLLB-200 (600M) mit LoRA/QLoRA auf einer 16-GB-GPU feinabgestimmt und Zero-Shot, volles Fine-Tuning und PEFT mit BLEU, chrF++ und TER sowie qualitativer Fehleranalyse verglichen.'), wins: [ { n: L('Both directions', 'Beide Richtungen'), l: L('LoRA beat zero-shot and full fine-tuning', 'LoRA schlägt Zero-Shot und volles Fine-Tuning') }, { n: L('10% params', '10 % Parameter'), l: L('trained, on a single 16 GB GPU', 'trainiert, auf einer 16-GB-GPU') } ],
        table: { cap: L('LoRA/QLoRA vs baselines · relative change (TER: lower is better)', 'LoRA/QLoRA ggü. Baselines · relative Veränderung (TER: niedriger ist besser)'), head: [L('Direction', 'Richtung'), L('BLEU vs zero-shot', 'BLEU ggü. Zero-Shot'), L('chrF++ vs zero-shot', 'chrF++ ggü. Zero-Shot'), L('TER vs zero-shot', 'TER ggü. Zero-Shot'), L('vs full fine-tuning', 'ggü. vollem Fine-Tuning')],
          rows: [ { c: [L('Odia → German', 'Odia → Deutsch'), '+35%', '+29%', '−26%', '+9% BLEU'] }, { c: [L('German → Odia', 'Deutsch → Odia'), '+85%', '+21%', '−30%', '+16% BLEU · +7% chrF++ · −8% TER'] } ] } }
      ] },
      { tab: L('2025–26 · Research', '2025–26 · Forschung'), kicker: L('Chapter 02', 'Kapitel 02'), years: L('Dec 2025 – Aug 2026', 'Dez. 2025 – Aug. 2026'), org: L('Applied AI Researcher · IU International University of Applied Sciences', 'Applied AI Researcher · IU International University of Applied Sciences'), mentor: { label: L('In collaboration with Prof. Dr. Tianxiang Lu', 'In Zusammenarbeit mit Prof. Dr. Tianxiang Lu'), url: 'https://www.linkedin.com/in/dr-rer-nat-tianxiang-lu/' }, title: L('From thesis to two peer-reviewed papers', 'Von der Masterarbeit zu zwei begutachteten Papern'), body: L('After graduating, I extended my thesis into a research collaboration with Prof. Dr. Tianxiang Lu. The corpus and bidirectional translation work became a Springer paper at AI4CHIEF 2026 in Paris. A new QLoRA ablation study with Optuna/TPE (optimum: learning rate 5.1×10⁻⁴, rank 128, dropout 0.05) and a 4-metric benchmark against GPT-5, Gemini 2.5 Pro and Claude Sonnet 4.5 became an IEEE paper at ICICoS 2026. I presented both.', 'Nach dem Abschluss habe ich meine Masterarbeit in einer Forschungskooperation mit Prof. Dr. Tianxiang Lu weitergeführt. Das Korpus und die bidirektionale Übersetzung wurden zu einem Springer-Paper auf der AI4CHIEF 2026 in Paris. Eine neue QLoRA-Ablationsstudie mit Optuna/TPE (Optimum: Lernrate 5,1×10⁻⁴, Rank 128, Dropout 0,05) und ein Benchmark mit 4 Metriken gegen GPT-5, Gemini 2.5 Pro und Claude Sonnet 4.5 wurden zu einem IEEE-Paper auf der ICICoS 2026. Beide habe ich präsentiert.'), wins: [ { n: L('2 papers', '2 Paper'), l: L('Springer (AI4CHIEF 2026) and IEEE (ICICoS 2026), both presented', 'Springer (AI4CHIEF 2026) und IEEE (ICICoS 2026), beide präsentiert') }, { n: L('#1 of 4', 'Platz 1 von 4'), l: L('German → Odia on BLEU, chrF++ and TER vs three frontier LLMs', 'Deutsch → Odia bei BLEU, chrF++ und TER ggü. drei Frontier-LLMs') }, { n: '2.2× GPT-5', l: L('BLEU in German → Odia (17.5 vs 8.1)', 'BLEU in Deutsch → Odia (17,5 vs. 8,1)') } ] },
      { tab: L('Now · Agentic AI', 'Heute · Agentic AI'), kicker: L('Chapter 03', 'Kapitel 03'), years: L('2026 → now', '2026 → heute'), org: L('Hands-on projects', 'Praxisprojekte'), title: L('Agents built like production software', 'Agenten, gebaut wie Produktionssoftware'), body: L('Multi-agent systems for product-safety compliance, supply-chain resilience, urban planning and supplier risk, built with MCP, A2A, RAG, evaluation harnesses, tracing and IaC.', 'Multi-Agenten-Systeme für Produktsicherheits-Compliance, Lieferketten-Resilienz, Stadtplanung und Lieferantenrisiko – mit MCP, A2A, RAG, Evaluations-Harnesses, Tracing und IaC.'), wins: [ { n: L('4 systems', '4 Systeme'), l: L('multi-agent apps on GitHub', 'Multi-Agenten-Apps auf GitHub') }, { n: 'MCP · A2A', l: L('tool and agent-to-agent protocols, with humans in the loop', 'Tool- und Agent-to-Agent-Protokolle, mit Menschen im Loop') } ] }
    ];
    const BENCH = {
      deor: [ ['LoRA · standard inference', true, 17.504817, 46.465875, 68.416419, 82.312126], ['LoRA · optimized inference', true, 17.111851, 46.174007, 68.713547, 82.221658], ['Gemini 2.5 Pro', false, 16.070632, 46.295084, 69.725982, 83.606876], ['Claude Sonnet 4.5', false, 14.871904, 44.830348, 73.445582, 82.608897], ['GPT-5', false, 8.073554, 37.729930, 80.103444, 80.266220] ],
      orde: [ ['Gemini 2.5 Pro', false, 33.654729, 62.205780, 58.810573, 86.796387], ['Claude Sonnet 4.5', false, 32.025087, 61.365033, 60.394378, 86.328290], ['LoRA · standard inference', true, 30.063955, 56.019427, 61.202014, 81.950075], ['GPT-5', false, 29.923673, 59.730667, 64.086428, 86.501465], ['LoRA · optimized inference', true, 29.610178, 55.592106, 61.569121, 81.761593] ]
    };
    const bdir = st.bench || 'deor';
    const brows = BENCH[bdir];
    const best = [2, 3, 4, 5].map((ci) => { const vals = brows.map((r) => r[ci]); return ci === 4 ? Math.min.apply(null, vals) : Math.max.apply(null, vals); });
    const fmt = (v) => (de ? v.toFixed(2).replace('.', ',') : v.toFixed(2));
    const bench = {
      tabs: [ { id: 'deor', label: L('German → Odia', 'Deutsch → Odia') }, { id: 'orde', label: L('Odia → German', 'Odia → Deutsch') } ].map((b) => ({ label: b.label, active: b.id === bdir, inactive: b.id !== bdir, pick: () => this.setState({ bench: b.id }) })),
      rows: brows.map((r) => ({ name: r[0], ours: r[1], theirs: !r[1], cells: [2, 3, 4, 5].map((ci, k) => ({ v: fmt(r[ci]), best: r[ci] === best[k], plain: r[ci] !== best[k] })) }))
    };
    const STEPS = [];
    CH.forEach((c, ci) => { if (c.subs) c.subs.forEach((x, si) => STEPS.push({ c: ci, s: si })); else STEPS.push({ c: ci, s: -1 }); });
    const step = Math.min(st.step || 0, STEPS.length - 1);
    const cur = STEPS[step];
    const chap = CH[cur.c];
    const subObj = cur.s >= 0 ? chap.subs[cur.s] : null;
    const view = subObj ? Object.assign({}, subObj, { kicker: chap.kicker, subLabel: chap.subLabel, partOf: true }) : Object.assign({}, chap, { partOf: false });
    view.hasMentor = !!view.mentor; view.hasTools = !!view.tools; view.hasClient = !!view.client; if (view.projects) view.projects = view.projects.map((q) => Object.assign({}, q, { hasGh: !!q.gh })); view.hasProjects = !!view.projects; view.hasTable = !!view.table; view.hasSubs = !!subObj;
    const go = (i) => this.setState(Object.assign({ step: i }, this.retype(['chTitle', 'chBody'])));
    view.subTabs = subObj ? chap.subs.map((x, si) => { const idx = STEPS.findIndex((p) => p.c === cur.c && p.s === si); return { label: x.sub, active: si === cur.s, inactive: si !== cur.s, pick: () => go(idx) }; }) : [];
    const chapters = CH.map((c, i) => ({ tab: c.tab, active: i === cur.c, inactive: i !== cur.c, pick: () => go(STEPS.findIndex((p) => p.c === i)) }));

    const CAPS = [
      { no: '01', h: L('Agentic systems', 'Agentensysteme'), proof: L('Multi-agent apps with MCP tools, A2A, context compaction, memory, model failover and human approval gates, grounded with RAG and source citations.', 'Multi-Agenten-Apps mit MCP-Tools, A2A, Kontextverdichtung, Memory, Modell-Failover und menschlichen Freigabeschritten – fundiert durch RAG mit Quellenangaben.'), where: L('Recall Radar · Supply Chain Resilience · City Planner · Supplier Risk', 'Recall Radar · Supply Chain Resilience · City Planner · Supplier Risk'), tools: ['LangGraph', 'Google ADK', 'CrewAI', 'MCP', 'A2A', 'pgvector'] },
      { no: '02', h: L('RAG & knowledge systems', 'RAG & Wissenssysteme'), proof: L('Retrieval pipelines that keep LLM answers grounded in real documents: parsing and chunking, embeddings and vector search, metadata filtering and re-ranking, and answers that cite their sources. Measured with retrieval-quality and faithfulness metrics, and tuned for latency and token cost.', 'Retrieval-Pipelines, die LLM-Antworten in echten Dokumenten verankern: Parsing und Chunking, Embeddings und Vektorsuche, Metadaten-Filter und Re-Ranking sowie Antworten mit Quellenangaben. Gemessen mit Retrieval-Qualität und Faithfulness, optimiert auf Latenz und Token-Kosten.'), where: L('Recall Radar · legal RAG over EU product-safety law with pgvector · Montgomery City Planner · zoning PDFs with page citations', 'Recall Radar · Rechts-RAG über EU-Produktsicherheitsrecht mit pgvector · Montgomery City Planner · Bebauungs-PDFs mit Seitenzitaten'), tools: ['LangChain', 'ChromaDB', 'Pinecone', 'pgvector', L('Embeddings', 'Embeddings'), 'Ragas'] },
      { no: '03', h: L('AI system design', 'AI-Systemdesign'), proof: L('Designing the whole system, not just the prompt: choosing between RAG, fine-tuning and agents for the problem, sizing models against latency and cost budgets, single- vs multi-agent topologies, state and memory, caching, model failover, and where a human must stay in the loop. Decisions are documented as trade-offs, not defaults.', 'Das ganze System entwerfen, nicht nur den Prompt: zwischen RAG, Fine-Tuning und Agenten abwägen, Modelle nach Latenz- und Kostenbudgets dimensionieren, Single- vs. Multi-Agenten-Topologien, Zustand und Memory, Caching, Modell-Failover und festlegen, wo ein Mensch im Loop bleiben muss. Entscheidungen werden als Trade-offs dokumentiert, nicht als Standard.'), where: L('Supply Chain Resilience · supervisor + specialist agents with a budget gate · Recall Radar · medallion data platform feeding RAG and agents', 'Supply Chain Resilience · Supervisor- und Spezialagenten mit Budget-Gate · Recall Radar · Medallion-Datenplattform als Basis für RAG und Agenten'), tools: [L('Architecture trade-offs', 'Architektur-Trade-offs'), L('Latency & cost budgets', 'Latenz- & Kostenbudgets'), 'Multi-agent topologies', 'Human-in-the-loop', L('Caching & failover', 'Caching & Failover')] },
      { no: '04', h: L('LLM fine-tuning', 'LLM-Fine-Tuning'), proof: L('Adapting open models to a new domain, task or language: curating clean, leakage-free training data, choosing between full fine-tuning and parameter-efficient methods, running systematic hyperparameter searches, and using quantisation to train on modest hardware. Every run is reproducible and compared against a strong baseline.', 'Offene Modelle an neue Domänen, Aufgaben oder Sprachen anpassen: saubere, leckagefreie Trainingsdaten kuratieren, zwischen vollem Fine-Tuning und parametereffizienten Methoden abwägen, systematische Hyperparameter-Suchen durchführen und mit Quantisierung auf bescheidener Hardware trainieren. Jeder Lauf ist reproduzierbar und gegen eine starke Baseline verglichen.'), where: L('Odia ↔ German NMT · open models on Hugging Face · 2 peer-reviewed papers', 'Odia ↔ Deutsch NMT · offene Modelle auf Hugging Face · 2 begutachtete Paper'), tools: ['PyTorch', 'Hugging Face Transformers', 'PEFT', 'LoRA / QLoRA', 'Optuna'] },
      { no: '05', h: L('AI system evaluation', 'Evaluation von AI-Systemen'), proof: L('Evaluating LLMs, RAG and agents before and after they ship: task-appropriate metrics on held-out data, statistical significance instead of single runs, retrieval quality and faithfulness for RAG, tool-call correctness and scenario-based tests for agents, and regression checks in CI so a prompt or model change cannot silently break behaviour.', 'LLMs, RAG und Agenten vor und nach dem Go-live evaluieren: passende Metriken auf Held-out-Daten, statistische Signifikanz statt Einzelläufen, Retrieval-Qualität und Faithfulness für RAG, korrekte Tool-Calls und szenariobasierte Tests für Agenten sowie Regressionstests in CI, damit Prompt- oder Modellwechsel nichts unbemerkt brechen.'), where: L('Benchmarks vs GPT-5, Gemini and Claude · Pytest scenario harness for agents · Recall Radar eval reports', 'Benchmarks ggü. GPT-5, Gemini und Claude · Pytest-Szenario-Harness für Agenten · Recall-Radar-Eval-Reports'), tools: ['Ragas', 'DeepEval', 'Langfuse', 'pytest', 'BLEU · chrF++ · COMET'] },
      { no: '06', h: L('Guardrails, security & monitoring', 'Guardrails, Sicherheit & Monitoring'), proof: L('Keeping AI systems safe and observable in production: schema-validated inputs and outputs, policy and budget limits on what agents may do, human approval for high-impact actions, GDPR-aware data handling, and end-to-end tracing of every LLM and tool call with cost, latency and quality tracked over time.', 'AI-Systeme im Betrieb sicher und beobachtbar halten: schema-validierte Ein- und Ausgaben, Richtlinien- und Budgetgrenzen für Agenten, menschliche Freigabe bei folgenreichen Aktionen, DSGVO-bewusster Umgang mit Daten und durchgängiges Tracing jedes LLM- und Tool-Calls mit Kosten, Latenz und Qualität im Zeitverlauf.'), where: L('Supply Chain Resilience · OpenTelemetry tracing and approval gate above budget · Recall Radar · human review before any notice is sent', 'Supply Chain Resilience · OpenTelemetry-Tracing und Freigabe oberhalb des Budgets · Recall Radar · menschliche Prüfung vor jeder Meldung'), tools: ['Pydantic', 'Guardrails', 'OpenTelemetry', 'Langfuse', L('Cost & latency tracking', 'Kosten- & Latenz-Tracking')] },
      { no: '07', h: L('Data engineering & pipelines', 'Data Engineering & Pipelines'), proof: L('Building the data foundation every AI product depends on: batch and streaming pipelines, layered bronze/silver/gold data models, data-quality checks with quarantine for bad records, change history, schema handling for nested JSON and AVRO, and clean, leakage-free datasets for training and evaluation. In every project, data preparation comes first, because that is where model quality is decided.', 'Das Datenfundament bauen, auf dem jedes KI-Produkt steht: Batch- und Streaming-Pipelines, geschichtete Bronze/Silver/Gold-Datenmodelle, Datenqualitätsprüfungen mit Quarantäne für fehlerhafte Datensätze, Änderungshistorie, Schema-Handling für verschachteltes JSON und AVRO sowie saubere, leckagefreie Datensätze für Training und Evaluation. In jedem Projekt steht die Datenaufbereitung am Anfang – denn dort entscheidet sich die Modellqualität.'), where: L('Recall Radar · Databricks medallion platform with quality checks · Odia–German corpus built with scraping and human validation · 6 years of pipelines at TCS and IBM (~1.5 TB/day, real-time Kafka)', 'Recall Radar · Databricks-Medallion-Plattform mit Qualitätsprüfungen · Odia–Deutsch-Korpus per Scraping und menschlicher Validierung · 6 Jahre Pipelines bei TCS und IBM (~1,5 TB/Tag, Echtzeit-Kafka)'), tools: ['PySpark', 'Kafka · ksqlDB', 'Azure Databricks', 'SQL', 'PostgreSQL', 'Hadoop'] },
      { no: '08', h: L('Machine learning & data science', 'Machine Learning & Data Science'), proof: L('Turning business questions into models that hold up: EDA and data-quality work, feature engineering, class-imbalance handling, model selection with cross-validated tuning, metrics chosen for the real cost of errors, and explainability so stakeholders trust the result. Classical ML, deep learning and recommender systems.', 'Geschäftsfragen in belastbare Modelle übersetzen: EDA und Datenqualität, Feature Engineering, Umgang mit Klassenungleichgewicht, Modellauswahl mit kreuzvalidiertem Tuning, Metriken nach den echten Fehlerkosten und Erklärbarkeit, damit Stakeholder dem Ergebnis vertrauen. Klassisches ML, Deep Learning und Empfehlungssysteme.'), where: L('Three M.Sc. industry projects (banking, payments, manufacturing) · production recommender on 13M+ customer records at TCS', 'Drei M.Sc.-Industrieprojekte (Banking, Payments, Fertigung) · produktives Empfehlungssystem auf 13 Mio.+ Kundendatensätzen bei TCS'), tools: ['scikit-learn', 'XGBoost', 'LightGBM', 'PyTorch', 'Pandas', 'CRISP-DM'] },
      { no: '09', h: L('Deployment & MLOps', 'Deployment & MLOps'), proof: L('Medallion data pipelines on Databricks, Dockerised APIs, OpenTelemetry tracing, Terraform, Helm on AKS and GitHub Actions, backed by 6 years of MLOps and data engineering at TCS and IBM.', 'Medallion-Datenpipelines auf Databricks, Docker-basierte APIs, OpenTelemetry-Tracing, Terraform, Helm auf AKS und GitHub Actions – gestützt auf 6 Jahre MLOps und Data Engineering bei TCS und IBM.'), where: L('Recall Radar · every project repo · industry prologue', 'Recall Radar · alle Projekt-Repos · Industrie-Prolog'), tools: ['FastAPI', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Databricks'] }
    ];
    const caps = CAPS.map((c, i) => Object.assign({}, c, { active: i === st.cap, inactive: i !== st.cap, pick: () => this.setState(Object.assign({ cap: i }, this.retype(['capProof']))) }));

    const SHIP = L('SHIPPED', 'ABGESCHLOSSEN');
    const gh = (url) => ({ label: 'GitHub', url: url, primary: true, secondary: false });
    const hf = (label, url) => ({ label: label, url: url, primary: false, secondary: true });
    const PROJ = [
      { id: 'recall', tag: 'agentic', tagLabel: 'Agentic AI', status: L('IN PROGRESS', 'IN ARBEIT'), fg: '#F5B83D', name: 'Recall Radar', resultLabel: L('Status', 'Status'), problem: L('Dangerous products flagged in EU Safety Gate alerts keep reappearing on online marketplaces.', 'Gefährliche Produkte aus EU-Safety-Gate-Warnungen tauchen immer wieder auf Online-Marktplätzen auf.'), approach: L('Multi-modal (text + image) matching of listings against alerts, RAG legal answers with citations to the GPSR (EU) 2023/988, and a multi-agent workflow with MCP tools and an A2A legal agent that drafts notices for human approval.', 'Multimodaler Abgleich (Text + Bild) von Angeboten mit Warnungen, RAG-Rechtsauskünfte mit Zitaten aus der GPSR (EU) 2023/988 und ein Multi-Agenten-Workflow mit MCP-Tools und einem A2A-Rechtsagenten, der Meldungen zur menschlichen Freigabe vorbereitet.'), result: L('Data platform done: Databricks bronze/silver/gold with data-quality checks, quarantine and SCD2, exported to Postgres + pgvector. Retrieval, agents and v1.0 land in late Nov 2026.', 'Datenplattform fertig: Databricks Bronze/Silver/Gold mit Datenqualitätsprüfungen, Quarantäne und SCD2, Export nach Postgres + pgvector. Retrieval, Agenten und v1.0 folgen Ende Nov. 2026.'), stack: ['FastAPI', 'Next.js', 'Databricks · Unity Catalog', 'Postgres + pgvector', 'Redis', 'Terraform', 'Helm · AKS', 'MCP', 'A2A'], videoLabel: L('Demo video · coming with v1.0', 'Demo-Video · erscheint mit v1.0'), links: [ gh('https://github.com/abhinandansamal/recall-radar') ] },
      { id: 'risk', tag: 'agentic', tagLabel: 'Agentic AI', status: SHIP, fg: '#7EE2A8', name: 'Supplier Risk Explainer', resultLabel: L('Result', 'Ergebnis'), problem: L('Investigators need supplier risk findings explained, not just scored.', 'Ermittler brauchen erklärte Lieferantenrisiken, nicht nur Scores.'), approach: L('Multi-agent explainer for enterprise investigations.', 'Multi-Agenten-Erklärsystem für Unternehmensuntersuchungen.'), result: L('[ ADD MEASURED RESULT ]', '[ MESSBARES ERGEBNIS ERGÄNZEN ]'), stack: ['Python', 'LangGraph', 'FastAPI', 'NVIDIA Nemotron', 'Zetaris', 'Docker'], video: 'https://www.youtube.com/watch?v=zaI_SsUVR88', links: [ gh('https://github.com/abhinandansamal/supplier-risk') ] },
      { id: 'supply', tag: 'agentic', tagLabel: 'Agentic AI', status: SHIP, fg: '#7EE2A8', diagram: true, name: 'Multi-Agent Supply Chain Resilience', resultLabel: L('Result', 'Ergebnis'), problem: L('Disruptions are spotted too late to re-route procurement.', 'Störungen werden zu spät erkannt, um die Beschaffung umzuleiten.'), approach: L('Three cooperating Gemini agents on Vertex AI (ReAct watchtower, procurement, supervisor) with MCP tools, an A2A supplier API and a human gate above budget.', 'Drei kooperierende Gemini-Agenten auf Vertex AI (ReAct-Watchtower, Beschaffung, Supervisor) mit MCP-Tools, A2A-Lieferanten-API und menschlicher Freigabe oberhalb des Budgets.'), result: L('Behaviour validated with a scenario-based Pytest harness; traced with OpenTelemetry; deployed to Cloud Run via Terraform.', 'Verhalten mit szenariobasiertem Pytest-Harness validiert; Tracing mit OpenTelemetry; Deployment auf Cloud Run per Terraform.'), stack: ['Python', 'FastAPI', 'TypeScript', 'SQLite', 'Docker', 'Google ADK', 'Google Vertex AI (Gemini 2.5 Flash-Lite)', 'Terraform', 'OpenTelemetry'], videoLabel: L('Demo video · 90 s walkthrough', 'Demo-Video · 90 s Rundgang'), links: [ gh('https://github.com/abhinandansamal/Multi-Agent-Supply-Chain-Resilience-System') ] },
      { id: 'nmt', tag: 'llm', tagLabel: 'LLM / NLP', status: SHIP, fg: '#7EE2A8', name: L('Odia ↔ German Neural MT', 'Odia ↔ Deutsch Neural MT'), resultLabel: L('Result', 'Ergebnis'), problem: L('Odia has almost no MT support, and frontier LLMs handle it poorly and expensively.', 'Für Odia gibt es kaum maschinelle Übersetzung, und Frontier-LLMs übersetzen es schlecht und teuer.'), approach: L('Leakage-free bidirectional corpus of 7,300+ Odia–German pairs; NLLB-200 (600M) with LoRA/QLoRA and full fine-tuning; Optuna ablations; 4-metric evaluation.', 'Leckagefreies bidirektionales Korpus mit 7.300+ Odia–Deutsch-Paaren; NLLB-200 (600M) mit LoRA/QLoRA und vollem Fine-Tuning; Optuna-Ablationen; Evaluation mit 4 Metriken.'), result: L('Into Odia it ranks #1 of 4 on BLEU, chrF++ and TER against GPT-5, Gemini 2.5 Pro and Claude Sonnet 4.5 (BLEU 17.5 vs GPT-5 8.1), and +85% BLEU over zero-shot. Models, dataset and live translators are public on Hugging Face.', 'Ins Odia Platz 1 von 4 bei BLEU, chrF++ und TER gegen GPT-5, Gemini 2.5 Pro und Claude Sonnet 4.5 (BLEU 17,5 vs. GPT-5 8,1) und +85 % BLEU ggü. Zero-Shot. Modelle, Datensatz und Live-Übersetzer sind öffentlich auf Hugging Face.'), stack: ['Python', 'PyTorch', 'Transformers', 'PEFT', 'Hugging Face', 'Gradio', 'QLoRA', 'Google Gemini (2.5 Pro)', 'OpenAI (GPT-5)', 'Anthropic (Claude Sonnet 4.5)'], videoLabel: L('Demo video · live translation', 'Demo-Video · Live-Übersetzung'), links: [ gh('https://github.com/abhinandansamal/odia-german-bidirectional-neural-machine-translation'), hf(L('Try it live (Space)', 'Live testen (Space)'), 'https://huggingface.co/spaces/abhinandansamal/Adapter-based-Odia-German-Translator'), hf(L('Model', 'Modell'), 'https://huggingface.co/abhinandansamal/nllb-200-distilled-600M-LoRA-finetuned-odia-german-bidirectional'), hf(L('Dataset', 'Datensatz'), 'https://huggingface.co/datasets/abhinandansamal/odia-german-parallel-corpus-research') ] }
    ];
    PROJ.forEach((p) => { p.hasVideo = !!p.video; p.noVideo = !p.video; p.videoLabel = p.video ? L('Play demo', 'Demo abspielen') : (p.id === 'recall' ? L('Demo video · coming with v1.0', 'Demo-Video · erscheint mit v1.0') : L('Demo video coming soon', 'Demo-Video folgt in Kürze')); });
    const FIL = [ { id: 'all', label: L('All', 'Alle') }, { id: 'agentic', label: 'Agentic AI' }, { id: 'llm', label: 'LLM / NLP' } ];
    const filters = FIL.map((f) => Object.assign({}, f, { active: f.id === st.filter, inactive: f.id !== st.filter, pick: () => {
      const first = PROJ.find((p) => f.id === 'all' || p.tag === f.id);
      this.setState({ filter: f.id, project: first ? first.id : st.project });
    } }));
    const list = PROJ.filter((p) => st.filter === 'all' || p.tag === st.filter);
    const shown = list.map((p) => Object.assign({}, p, { active: p.id === st.project, inactive: p.id !== st.project, pick: () => this.setState({ project: p.id }) }));
    const proj = PROJ.find((p) => p.id === st.project) || list[0] || PROJ[0];
    const ytId = proj.video ? (proj.video.split('v=')[1] || '').split('&')[0] : '';
    proj.embed = ytId ? 'https://www.youtube-nocookie.com/embed/' + ytId + '?autoplay=1&rel=0' : '';
    proj.playing = !!ytId && st.playing === proj.id;
    proj.showPlay = !!ytId && !proj.playing;
    proj.play = () => this.setState({ playing: proj.id });

    const DOCS = {
      cv: { file: 'assets/files/Abhinandan_Samal_CV.pdf', title: L('CV · Abhinandan Samal', 'Lebenslauf · Abhinandan Samal'), sub: L('2 pages · current version', '2 Seiten · aktuelle Fassung'), unit: L('Page', 'Seite'), pages: ['assets/docs/cv/p01.jpg', 'assets/docs/cv/p02.jpg'] },
      a4p: { file: 'assets/files/AI4CHIEF_2026_Paper_Samal_Lu.pdf', title: L('Paper · AI4CHIEF 2026', 'Paper · AI4CHIEF 2026'), sub: L('Camera-ready version · Springer (forthcoming)', 'Camera-Ready-Fassung · Springer (in Vorbereitung)'), unit: L('Page', 'Seite'), pages: ['assets/docs/ai4chief-paper/p01.jpg', 'assets/docs/ai4chief-paper/p02.jpg', 'assets/docs/ai4chief-paper/p03.jpg', 'assets/docs/ai4chief-paper/p04.jpg', 'assets/docs/ai4chief-paper/p05.jpg', 'assets/docs/ai4chief-paper/p06.jpg', 'assets/docs/ai4chief-paper/p07.jpg', 'assets/docs/ai4chief-paper/p08.jpg', 'assets/docs/ai4chief-paper/p09.jpg', 'assets/docs/ai4chief-paper/p10.jpg', 'assets/docs/ai4chief-paper/p11.jpg', 'assets/docs/ai4chief-paper/p12.jpg', 'assets/docs/ai4chief-paper/p13.jpg', 'assets/docs/ai4chief-paper/p14.jpg'] },
      a4s: { file: 'assets/files/AI4CHIEF_2026_Presentation_Samal.pdf', title: L('Presentation · AI4CHIEF 2026, Paris', 'Präsentation · AI4CHIEF 2026, Paris'), sub: L('Slides as presented, 16 Apr 2026', 'Folien wie präsentiert, 16.04.2026'), unit: L('Slide', 'Folie'), pages: ['assets/docs/ai4chief-slides/s01.jpg', 'assets/docs/ai4chief-slides/s02.jpg', 'assets/docs/ai4chief-slides/s03.jpg', 'assets/docs/ai4chief-slides/s04.jpg', 'assets/docs/ai4chief-slides/s05.jpg', 'assets/docs/ai4chief-slides/s06.jpg', 'assets/docs/ai4chief-slides/s07.jpg', 'assets/docs/ai4chief-slides/s08.jpg', 'assets/docs/ai4chief-slides/s09.jpg', 'assets/docs/ai4chief-slides/s10.jpg', 'assets/docs/ai4chief-slides/s11.jpg', 'assets/docs/ai4chief-slides/s12.jpg', 'assets/docs/ai4chief-slides/s13.jpg', 'assets/docs/ai4chief-slides/s14.jpg', 'assets/docs/ai4chief-slides/s15.jpg', 'assets/docs/ai4chief-slides/s16.jpg'] },
      icp: { file: 'assets/files/ICICoS_2026_Paper_Samal_Lu.pdf', title: L('Paper · ICICoS 2026', 'Paper · ICICoS 2026'), sub: L('Accepted version · IEEE proceedings forthcoming', 'Angenommene Fassung · IEEE-Tagungsband in Vorbereitung'), unit: L('Page', 'Seite'), pages: ['assets/docs/icicos-paper/p01.jpg', 'assets/docs/icicos-paper/p02.jpg', 'assets/docs/icicos-paper/p03.jpg', 'assets/docs/icicos-paper/p04.jpg', 'assets/docs/icicos-paper/p05.jpg', 'assets/docs/icicos-paper/p06.jpg'] },
      ica: { file: 'assets/files/ICICoS_2026_Author_Certificate.pdf', title: L('Author certificate · ICICoS 2026', 'Autorenzertifikat · ICICoS 2026'), sub: L('Awarded to Abhinandan Samal and Tianxiang Lu', 'Verliehen an Abhinandan Samal und Tianxiang Lu'), unit: '', pages: ['assets/docs/icicos-author-certificate.jpg'] },
      icr: { file: 'assets/files/ICICoS_2026_Presenter_Certificate.pdf', title: L('Presenter certificate · ICICoS 2026', 'Referentenzertifikat · ICICoS 2026'), sub: L('Awarded to Abhinandan Samal · Semarang, 12–13 Aug 2026', 'Verliehen an Abhinandan Samal · Semarang, 12.–13. Aug. 2026'), unit: '', pages: ['assets/docs/icicos-presenter-certificate.jpg'] },
      ics: { file: 'assets/files/ICICoS_2026_Presentation_Samal.pdf', title: L('Presentation · ICICoS 2026, Semarang', 'Präsentation · ICICoS 2026, Semarang'), sub: L('Slides as presented, Aug 2026', 'Folien wie präsentiert, Aug. 2026'), unit: L('Slide', 'Folie'), pages: ['assets/docs/icicos-slides/s01.jpg', 'assets/docs/icicos-slides/s02.jpg', 'assets/docs/icicos-slides/s03.jpg', 'assets/docs/icicos-slides/s04.jpg', 'assets/docs/icicos-slides/s05.jpg', 'assets/docs/icicos-slides/s06.jpg', 'assets/docs/icicos-slides/s07.jpg', 'assets/docs/icicos-slides/s08.jpg', 'assets/docs/icicos-slides/s09.jpg', 'assets/docs/icicos-slides/s10.jpg', 'assets/docs/icicos-slides/s11.jpg'] }
    };
    const openDoc = (id) => () => this.setState({ viewer: id, vpage: 0 });
    const item = (id, icon, label, sub) => ({ icon: icon, label: label, sub: sub, open: openDoc(id) });
    const ASSETS = [
      { icon: 'GH', label: L('Code on GitHub', 'Code auf GitHub'), sub: L('Training, evaluation and benchmark pipeline', 'Trainings-, Evaluations- und Benchmark-Pipeline'), url: 'https://github.com/abhinandansamal/odia-german-bidirectional-neural-machine-translation' },
      { icon: 'HF', label: L('LoRA model', 'LoRA-Modell'), sub: L('NLLB-200 600M · LoRA fine-tuned · Hugging Face', 'NLLB-200 600M · LoRA-feinabgestimmt · Hugging Face'), url: 'https://huggingface.co/abhinandansamal/nllb-200-distilled-600M-LoRA-finetuned-odia-german-bidirectional' },
      { icon: 'HF', label: L('Full fine-tuned model', 'Voll feinabgestimmtes Modell'), sub: L('NLLB-200 600M · full fine-tuning baseline · Hugging Face', 'NLLB-200 600M · Baseline mit vollem Fine-Tuning · Hugging Face'), url: 'https://huggingface.co/abhinandansamal/nllb-200-distilled-600M-full-finetuned-odia-german-bidirectional' },
      { icon: 'HF', label: L('Live demos (Spaces)', 'Live-Demos (Spaces)'), sub: L('Try both translators in the browser', 'Beide Übersetzer im Browser testen'), url: 'https://huggingface.co/abhinandansamal/spaces' },
      { icon: 'HF', label: L('Dataset', 'Datensatz'), sub: L('Odia–German parallel corpus · Hugging Face', 'Odia–Deutsch-Parallelkorpus · Hugging Face'), url: 'https://huggingface.co/datasets/abhinandansamal/odia-german-parallel-corpus-research' }
    ];
    const PUBS = [
      { id: 'a', venue: 'Springer · AI4CHIEF 2026 · Paris', title: 'Enabling Digital Documentation of Odia, a Low-Resource Indo-Aryan Language, through Efficient Bidirectional Odia–German Machine Translation',
        status: L('Accepted · presented Apr 2026, Paris (Track 3: AI for Language Revitalization) · Springer proceedings pending', 'Angenommen · präsentiert Apr. 2026, Paris (Track 3: AI for Language Revitalization) · Springer-Tagungsband ausstehend'),
        proof: [ item('a4p', '▤', 'Paper', L('Camera-ready · 14 pages', 'Camera-Ready · 14 Seiten')), item('a4s', '▶', L('Presentation', 'Präsentation'), L('16 slides', '16 Folien')) ] },
      { id: 'b', venue: 'IEEE · ICICoS 2026 · Semarang', title: 'Parameter-Efficient Adaptation for Low-Resource Machine Translation: An Ablation Study and Benchmark Against Large Language Models',
        status: L('Accepted · presented 12–13 Aug 2026, Universitas Diponegoro, Indonesia · IEEE proceedings pending', 'Angenommen · präsentiert 12.–13. Aug. 2026, Universitas Diponegoro, Indonesien · IEEE-Tagungsband ausstehend'),
        proof: [ item('icp', '▤', 'Paper', L('Accepted version · 6 pages', 'Angenommene Fassung · 6 Seiten')), item('ica', '✓', L('Author Certificate', 'Autorenzertifikat'), 'ICICoS 2026'), item('icr', '✓', L('Presenter Certificate', 'Referentenzertifikat'), 'ICICoS 2026'), item('ics', '▶', L('Presentation', 'Präsentation'), L('11 slides', '11 Folien')) ] }
    ];
    const ADDR = L('Waldstraße 78\n13403 Berlin, Germany', 'Waldstraße 78\n13403 Berlin, Deutschland');
    const LEGAL = {
      imprint: { title: 'Impressum', sections: [
        { h: L('Information pursuant to § 5 DDG', 'Angaben gemäß § 5 DDG'), p: 'Abhinandan Samal\n' + ADDR },
        { h: L('Contact', 'Kontakt'), p: L('Email: abhinandan198@gmail.com', 'E-Mail: abhinandan198@gmail.com') },
        { h: L('Responsible for content pursuant to § 18 (2) MStV', 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV'), p: 'Abhinandan Samal\n' + ADDR },
        { h: L('Liability for links', 'Haftung für Links'), p: L('This website links to external sites (e.g. GitHub, Hugging Face, LinkedIn, YouTube). I have no influence on their content; the respective provider is responsible for it.', 'Diese Website enthält Links zu externen Seiten (z. B. GitHub, Hugging Face, LinkedIn, YouTube). Auf deren Inhalte habe ich keinen Einfluss; verantwortlich ist der jeweilige Anbieter.') }
      ] },
      privacy: { title: L('Privacy policy', 'Datenschutzerklärung'), sections: [
        { h: L('1. Controller', '1. Verantwortlicher'), p: 'Abhinandan Samal\n' + ADDR + '\n' + L('Email: abhinandan198@gmail.com', 'E-Mail: abhinandan198@gmail.com') },
        { h: L('2. Hosting and server logs', '2. Hosting und Server-Logfiles'), p: L('This website is hosted on GitHub Pages (GitHub, Inc.). When you visit, the host automatically processes technical data such as your IP address, date and time, and browser type to deliver the site and keep it secure. Legal basis: Art. 6(1)(f) GDPR. GitHub is certified under the EU–US Data Privacy Framework.', 'Diese Website wird über GitHub Pages (GitHub, Inc.) gehostet. Beim Aufruf verarbeitet der Hoster automatisch technische Daten wie IP-Adresse, Datum und Uhrzeit sowie Browsertyp, um die Seite auszuliefern und sicher zu betreiben. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. GitHub ist unter dem EU-US Data Privacy Framework zertifiziert.') },
        { h: L('3. No cookies, no tracking', '3. Keine Cookies, kein Tracking'), p: L('This website sets no cookies and uses no analytics or tracking tools. Fonts and documents are served from this website itself, not from third-party servers.', 'Diese Website setzt keine Cookies und nutzt keine Analyse- oder Tracking-Tools. Schriften und Dokumente werden von dieser Website selbst ausgeliefert, nicht von Servern Dritter.') },
        { h: L('4. Videos and external links', '4. Videos und externe Links'), p: L('Project demo videos are hosted on YouTube and only load after you click play, in privacy-enhanced mode. Links to GitHub, Hugging Face, LinkedIn and YouTube take you to third-party websites, whose own privacy policies apply.', 'Projekt-Demovideos liegen auf YouTube und werden erst nach Klick im erweiterten Datenschutzmodus geladen. Links zu GitHub, Hugging Face, LinkedIn und YouTube führen zu Websites Dritter, für die deren eigene Datenschutzerklärungen gelten.') },
        { h: L('5. Contact by email', '5. Kontakt per E-Mail'), p: L('If you email me, I use your details only to reply and delete them once they are no longer needed. Legal basis: Art. 6(1)(b) and (f) GDPR.', 'Wenn Sie mir eine E-Mail schreiben, nutze ich Ihre Angaben nur zur Beantwortung und lösche sie, sobald sie nicht mehr benötigt werden. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und f DSGVO.') },
        { h: L('6. Your rights', '6. Ihre Rechte'), p: L('You have the right to access, rectification, erasure, restriction of processing, data portability and objection (Art. 15–21 GDPR). You may also complain to a supervisory authority, e.g. the Berlin Commissioner for Data Protection and Freedom of Information.', 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Zudem können Sie sich bei einer Aufsichtsbehörde beschweren, z. B. bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit.') }
      ] }
    };
    const ld = st.legal ? LEGAL[st.legal] : null;
    const lg = ld ? { open: true, title: ld.title, sections: ld.sections, updated: L('Last updated: November 2026', 'Stand: November 2026'), close: () => this.setState({ legal: null }) } : { open: false };
    const vd = st.viewer ? DOCS[st.viewer] : null;
    const vp = vd ? Math.min(st.vpage || 0, Math.max(0, vd.pages.length - 1)) : 0;
    const vw = vd ? {
      open: true, title: vd.title, sub: vd.sub, hasFile: !!vd.file, file: vd.file || '',
      hasPages: vd.pages.length > 0, pending: vd.pages.length === 0, multi: vd.pages.length > 1,
      src: vd.pages[vp] || '', alt: vd.title + (vd.unit ? ' — ' + vd.unit + ' ' + (vp + 1) : ''),
      counter: vd.unit + ' ' + (vp + 1) + ' / ' + vd.pages.length,
      prev: () => this.setState({ vpage: (vp + vd.pages.length - 1) % vd.pages.length }),
      next: () => this.setState({ vpage: (vp + 1) % vd.pages.length }),
      close: () => this.setState({ viewer: null, vpage: 0 })
    } : { open: false };
    const pubs = PUBS.map((u) => {
      const open = !!st.open[u.id];
      return Object.assign({}, u, { assets: ASSETS, open: open, btn: open ? L('Hide proof ↑', 'Nachweise ausblenden ↑') : L('View proof ↓', 'Nachweise anzeigen ↓'), toggle: () => this.setState({ open: Object.assign({}, st.open, { [u.id]: !open }) }) });
    });

    const STACK = [
      { h: L('Generative AI & LLMs', 'Generative KI & LLMs'), items: ['OpenAI API', 'Gemini API', 'Claude API', 'NVIDIA Nemotron', 'Hugging Face Transformers'] },
      { h: 'Agentic AI', items: ['LangGraph', 'LangChain', 'CrewAI', 'Google ADK', 'MCP', 'A2A', L('Multi-agent orchestration', 'Multi-Agenten-Orchestrierung'), L('Tool / function calling', 'Tool- / Function-Calling')] },
      { h: L('RAG & knowledge', 'RAG & Wissen'), items: ['ChromaDB', 'Pinecone', 'pgvector', L('Vector search', 'Vektorsuche'), 'Embeddings', L('Semantic search', 'Semantische Suche')] },
      { h: 'Fine-tuning', items: ['PEFT', 'LoRA', 'QLoRA', L('Full fine-tuning', 'Volles Fine-Tuning'), 'Optuna'] },
      { h: 'Machine Learning', items: ['Linear Regression', 'Ridge Regression', 'Lasso Regression', 'Logistic Regression', 'Support Vector Machine', 'Random Forest', 'XGBoost', 'LightGBM', 'scikit-learn', 'Pandas', 'NumPy'] },
      { h: 'Deep Learning', items: ['ANN', 'CNN', 'RNN', 'LSTM', 'Autoencoders', 'PyTorch'] },
      { h: L('Backend & data', 'Backend & Daten'), items: ['Python', 'SQL', 'JavaScript', 'FastAPI', 'Pydantic', 'Flask', 'Next.js', 'PostgreSQL', 'MySQL', 'Redis', 'PySpark', 'Kafka', 'Azure Databricks'] },
      { h: L('Cloud & infra', 'Cloud & Infrastruktur'), items: ['Azure', 'AWS', 'GCP Vertex AI', 'Docker', 'Kubernetes', 'Helm', 'Terraform'] },
      { h: L('MLOps & quality', 'MLOps & Qualität'), items: ['MLflow', 'GitHub Actions', 'pytest', 'Ruff', 'mypy', 'uv', 'Git'] }
    ];
    const stackTabs = STACK.map((s, i) => Object.assign({}, s, { active: i === st.stackTab, inactive: i !== st.stackTab, pick: () => this.setState({ stackTab: i }) }));

    const certs = [
      { mono: 'ZT', name: 'AI Data Harness Solution Developer', issuer: 'Zetaris × SpaceXSI', url: 'https://www.zetaris.com/credentials/ztr-dhsd-3wy9b9' },
      { mono: 'GA', name: L('Certificate of Participation – Open Agent Hackathon 2026', 'Teilnahmezertifikat – Open Agent Hackathon 2026'), issuer: 'GenAI Works', url: 'https://hackathon.genai.works/verify/CERT-2026-ZFNQM' },
      { mono: 'KG', name: L('5-Day AI Agents Intensive Course with Google', '5-Day AI Agents Intensive Course mit Google'), issuer: 'Kaggle × Google', url: 'https://www.kaggle.com/certification/badges/samalabhinandan/105' },
      { mono: 'UD', name: 'Azure Databricks & Spark for Data Engineers: Hands-on Project', issuer: 'Udemy', url: 'https://www.udemy.com/certificate/UC-fdb188b0-50bb-4427-a613-25ed2c13ba46/' },
      { mono: 'PG', name: 'Executive PG Programme in Data Science', issuer: 'International Institute of Information Technology Bangalore (IIIT-B)', url: 'https://www.credential.net/89d94967-1ccc-4b2c-81b3-651f2e7fcfb4#acc.Odk3nloj' }
    ];

    return {
      recs: [
        { initials: 'SM', name: 'Subham Majumdar', role: L('Associate Director, LTIMindtree · former Senior Project Manager, IBM', 'Associate Director, LTIMindtree · ehem. Senior Project Manager, IBM'), rel: L('Managed me directly at IBM · Aug 2024', 'Mein direkter Vorgesetzter bei IBM · Aug. 2024'), quote: 'I was managing a 22+ members Offshore team where Abhinandan worked as the Lead of Kafka-Ksqldb team where his constructive approach towards the given tasks and accuracy of delivering the things in time was really commendable. He was also a quick learner, good communicator and team player.' },
        { initials: 'AG', name: 'Aarthy Ganesh Kumar', role: L('Full Stack Developer, eBay', 'Full Stack Developer, eBay'), rel: L('Managed me directly at IBM · Aug 2024', 'Meine direkte Vorgesetzte bei IBM · Aug. 2024'), quote: 'His meticulous approach to tasks and projects ensured accuracy and high-quality results. He consistently demonstrated a growth mindset, eagerly seeking opportunities to expand his skills and knowledge. His approach to solving complex problems are indeed commendable. He was a great asset to the team.' },
        { initials: 'NP', name: 'Nimisha P', role: L('Senior Data Engineer', 'Senior Data Engineer'), rel: L('Worked with me on the same team at IBM · Aug 2024', 'Kollegin im selben Team bei IBM · Aug. 2024'), quote: 'Abhinandan consistently demonstrated a deep understanding of Kafka, KSQL, and KStream, and his problem-solving abilities were truly impressive. He also extended his expertise by assisting the architect in providing reliable data flow designs.' }
      ],
      t: t, langs: langs, nav: nav, stg: stg, vw: vw, bench: bench, lg: lg,
      openCv: () => this.setState({ viewer: 'cv', vpage: 0 }),
      openImprint: () => this.setState({ legal: 'imprint' }), openPrivacy: () => this.setState({ legal: 'privacy' }),
      ty: { h1b: T('h1b', t.h1b), storyH2: T('storyH2', t.storyH2), tagline: T('tagline', t.tagline), bringH2: T('bringH2', t.bringH2), workH2: T('workH2', t.workH2), resH2: T('resH2', t.resH2), stackH2: T('stackH2', t.stackH2), certH2: T('certH2', t.certH2), contactH2: T('contactH2', t.contactH2), recsH2: T('recsH2', t.recsH2), chTitle: T('chTitle', view.title), chBody: T('chBody', view.body), capProof: T('capProof', CAPS[st.cap].proof) },
      nums: (() => {
        const c = (st.count && st.count.all !== undefined) ? st.count.all : 1;
        const e = 1 - Math.pow(1 - c, 3);
        const f = (v) => Math.round(v * e);
        return [
          { v: f(6) + L(' yrs', ' Jahre'), l: L('shipping data and ML systems to production at TCS and IBM', 'Data- und ML-Systeme in Produktion bei TCS und IBM') },
          { v: '#' + Math.max(1, Math.round(4 - 3 * e)) + L(' of 4', ' von 4'), l: L('ranked against GPT-5, Gemini 2.5 Pro and Claude Sonnet 4.5 translating German into Odia, with a 600M model', 'im Vergleich mit GPT-5, Gemini 2.5 Pro und Claude Sonnet 4.5 bei der Übersetzung von Deutsch ins Odia – mit einem 600M-Modell') },
          { v: String(f(2)), l: L('peer-reviewed papers, Springer and IEEE, both presented', 'begutachtete Paper, Springer und IEEE, beide präsentiert') },
          { v: String(f(4)), l: L('multi-agent systems built with MCP, A2A, RAG and evals', 'Multi-Agenten-Systeme mit MCP, A2A, RAG und Evals') },
          { v: '−' + f(87) + '%', l: L('model storage cost via 4-bit QLoRA, training only 10% of parameters', 'Speicherbedarf durch 4-Bit-QLoRA, bei nur 10 % trainierten Parametern') }
        ];
      })(),
      showRecall: () => { this._lockUntil = Date.now() + 900; this.setState({ filter: 'all', project: 'recall', section: 'work' }); },
      chapters: chapters,
      ch: view,
      chapPct: Math.round(((step + 1) / STEPS.length) * 100) + '%',
      prevChapter: () => go((step + STEPS.length - 1) % STEPS.length),
      nextChapter: () => go((step + 1) % STEPS.length),
      caps: caps, cap: CAPS[st.cap],
      filters: filters, shown: shown, proj: proj,
      pubs: pubs,
      stackTabs: stackTabs, stack: STACK[st.stackTab],
      certs: certs
    };
  }
}

App.prototype.render = function () {
  const v = this.renderVals();
  return html`<div style="font-family: Inter, system-ui, sans-serif; color: #E8EAEE; background: #0B0D12; min-height: 100vh">


<header style="position: sticky; top: 0; z-index: 10; background: rgba(11,13,18,0.92); border-bottom: 1px solid #262B36">
<div class="progress" style="position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: #F5B83D; transform-origin: 0 50%"></div>
<nav style="max-width: 1360px; margin: 0 auto; padding: 14px 32px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px">
<a href="#top" style="display: flex; align-items: center; gap: 10px; text-decoration: none; color: #E8EAEE">
<span style="width: 36px; height: 36px; border-radius: 10px; background: #F5B83D; color: #0B0D12; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px">AS</span>
<span style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 17px">Abhinandan Samal</span>
</a>
<div style="display: flex; flex-wrap: wrap; gap: 4px 2px; flex: 1 1 auto; font-size: 14px">
${(v.nav || []).map((n, $index) => html`
${n.active ? html`<a href=${n.href} onClick=${n.pick} aria-current="true" style="color: #F5B83D; text-decoration: none; padding: 8px 10px; border-radius: 8px; background: #2A2312; font-weight: 600; transition: all .25s ease">${n.label}</a>` : null}
${n.inactive ? html`<a href=${n.href} onClick=${n.pick} style="color: #B8BEC8; text-decoration: none; padding: 8px 10px; border-radius: 8px; transition: all .25s ease">${n.label}</a>` : null}
`)}
</div>
<div style="display: flex; gap: 10px; align-items: center">
<div role="group" aria-label="Language" style="display: flex; border: 1px solid #3A4150; border-radius: 999px; padding: 3px">
${(v.langs || []).map((l, $index) => html`
${l.active ? html`<button onClick=${l.pick} aria-pressed="true" style="min-width: 44px; padding: 8px 12px; border-radius: 999px; border: none; background: #E8EAEE; color: #0B0D12; font-size: 13px; font-weight: 700; cursor: pointer">${l.label}</button>` : null}
${l.inactive ? html`<button onClick=${l.pick} aria-pressed="false" style="min-width: 44px; padding: 8px 12px; border-radius: 999px; border: none; background: transparent; color: #B8BEC8; font-size: 13px; font-weight: 600; cursor: pointer">${l.label}</button>` : null}
`)}
</div>
<button onClick=${v.openCv} style="padding: 11px 18px; border-radius: 999px; background: #F5B83D; color: #0B0D12; text-decoration: none; font-size: 14px; font-weight: 700; border: none; cursor: pointer">${v.t.cv}</button>
</div>
</nav>
</header>


<section id="top" style="max-width: 1200px; margin: 0 auto; padding: 88px 32px 40px; display: flex; flex-wrap: wrap; gap: 56px; align-items: center">
<div style="flex: 999 1 600px; min-width: 0; display: flex; flex-direction: column; gap: 22px">
<span style="font-size: 18px; font-weight: 600; color: #5CC8E8">${v.t.hello}</span>
<h1 style="margin: -6px 0 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(46px, 11vw, 84px); line-height: 1; letter-spacing: -0.035em">Abhinandan Samal</h1>
<p style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: clamp(24px, 5.5vw, 34px); line-height: 1.22; letter-spacing: -0.015em; color: #F5B83D; max-width: 720px"><span>${v.ty.h1b.typed}</span>${v.ty.h1b.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.h1b.rest}</span></p>
<p style="margin: 0; font-size: 19px; line-height: 1.6; color: #B8BEC8; max-width: 660px">${v.t.heroP}</p>
<div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px">
<a href="#work" style="padding: 15px 22px; border-radius: 10px; background: #F5B83D; color: #0B0D12; text-decoration: none; font-weight: 700">${v.t.btnSystems}</a>
<a href="https://github.com/abhinandansamal" style="padding: 15px 22px; border-radius: 10px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-weight: 600">GitHub ↗</a>
<a href="https://huggingface.co/abhinandansamal" style="padding: 15px 22px; border-radius: 10px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-weight: 600">Hugging Face ↗</a>
<a href="mailto:abhinandan198@gmail.com" style="padding: 15px 22px; border-radius: 10px; color: #E8EAEE; text-decoration: underline; font-weight: 600">${v.t.btnEmail}</a>
</div>
</div>
<div style="flex: 1 1 300px; display: flex; justify-content: center">
<div style="width: 330px; max-width: 100%; background: #141821; border: 1px solid #262B36; border-radius: 18px; overflow: hidden">
<div style="display: flex; gap: 6px; padding: 12px 14px; border-bottom: 1px solid #262B36"><span style="width: 10px; height: 10px; border-radius: 50%; background: #3A4150"></span><span style="width: 10px; height: 10px; border-radius: 50%; background: #3A4150"></span><span style="width: 10px; height: 10px; border-radius: 50%; background: #3A4150"></span></div>
<img src="assets/img/abhinandan-samal.jpg" alt="Portrait of Abhinandan Samal" style="width: 100%; display: block; aspect-ratio: 1 / 1; object-fit: cover" />
</div>
</div>
</section>


<section style="max-width: 1200px; margin: 0 auto; padding: 0 32px 72px">
<div style="display: flex; flex-wrap: wrap; gap: 10px">
<span style="padding: 10px 14px; border-radius: 8px; background: #13261C; color: #7EE2A8; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 10px"><span class="live-dot" aria-hidden="true"></span>${v.t.avail}</span>
<span style="padding: 10px 14px; border-radius: 8px; background: #141821; border: 1px solid #262B36; color: #B8BEC8; font-size: 14px">${v.t.permitL} <strong style="color: #E8EAEE">${v.t.permitV}</strong></span>
<span style="padding: 10px 14px; border-radius: 8px; background: #141821; border: 1px solid #262B36; color: #B8BEC8; font-size: 14px">${v.t.locL} <strong style="color: #E8EAEE">${v.t.locV}</strong></span>
<span style="padding: 10px 14px; border-radius: 8px; background: #141821; border: 1px solid #262B36; color: #B8BEC8; font-size: 14px">${v.t.langL} <strong style="color: #E8EAEE">${v.t.langV}</strong></span>
</div>
</section>


<section id="numbers" style="border-top: 1px solid #262B36; border-bottom: 1px solid #262B36; background: #10131A">
<div class=${v.stg.numbers} style="max-width: 1200px; margin: 0 auto; padding: 44px 32px; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 28px">
${(v.nums || []).map((m, $index) => html`
<div style="display: flex; flex-direction: column; gap: 6px">
<span style="font-family: 'Space Grotesk', sans-serif; font-size: 44px; font-weight: 700; color: #F5B83D; font-variant-numeric: tabular-nums; letter-spacing: -0.02em">${m.v}</span>
<span style="font-size: 14px; line-height: 1.45; color: #B8BEC8">${m.l}</span>
</div>
`)}
</div>
</section>


<section id="story" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 72px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.storyEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 46px); letter-spacing: -0.02em; max-width: 880px"><span>${v.ty.storyH2.typed}</span>${v.ty.storyH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.storyH2.rest}</span></h2>
</div>
<div role="tablist" aria-label="Career chapters" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px">
${(v.chapters || []).map((c, $index) => html`
${c.active ? html`
<button role="tab" aria-selected="true" onClick=${c.pick} style="padding: 12px 16px; border-radius: 10px; border: 1px solid #F5B83D; background: #2A2312; color: #F5B83D; font-size: 14px; font-weight: 700; cursor: pointer">${c.tab}</button>
` : null}
${c.inactive ? html`
<button role="tab" aria-selected="false" onClick=${c.pick} style="padding: 12px 16px; border-radius: 10px; border: 1px solid #262B36; background: #141821; color: #B8BEC8; font-size: 14px; font-weight: 600; cursor: pointer">${c.tab}</button>
` : null}
`)}
</div>
<div style="height: 3px; background: #262B36; border-radius: 3px; margin-bottom: 24px"><div style="height: 3px; background: #F5B83D; border-radius: 3px; width: ${v.chapPct}; transition: width .4s ease"></div></div>
<article class="swap" style="background: #141821; border: 1px solid #262B36; border-radius: 22px; padding: 40px; display: flex; flex-wrap: wrap; gap: 28px 56px; min-height: 280px">
${v.ch.hasSubs ? html`
<div style="flex: 1 1 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-bottom: 20px; border-bottom: 1px solid #262B36">
<span style="font-size: 13px; font-weight: 600; color: #9AA1AD; margin-right: 6px">${v.ch.subLabel}</span>
${(v.ch.subTabs || []).map((u, $index) => html`
${u.active ? html`<button onClick=${u.pick} aria-pressed="true" style="padding: 9px 14px; border-radius: 999px; border: none; background: #E8EAEE; color: #0B0D12; font-size: 13px; font-weight: 700; cursor: pointer">${u.label}</button>` : null}
${u.inactive ? html`<button onClick=${u.pick} aria-pressed="false" style="padding: 9px 14px; border-radius: 999px; border: 1px solid #3A4150; background: transparent; color: #B8BEC8; font-size: 13px; font-weight: 600; cursor: pointer">${u.label}</button>` : null}
`)}
</div>
` : null}
<div style="flex: 1 1 240px; display: flex; flex-direction: column; gap: 8px">
<span style="font-size: 14px; font-weight: 700; color: #F5B83D">${v.ch.kicker}</span>
<span style="font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700">${v.ch.years}</span>
<span style="font-size: 15px; color: #9AA1AD; line-height: 1.5">${v.ch.org}</span>
${v.ch.hasClient ? html`<span style="font-size: 14px; color: #5CC8E8; line-height: 1.5; font-weight: 600">${v.ch.client}</span>` : null}
${v.ch.hasMentor ? html`<a href=${v.ch.mentor.url} target="_blank" rel="noopener" style="align-self: flex-start; margin-top: 6px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 10px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-size: 14px; font-weight: 600">${v.ch.mentor.label} <span style="color: #F5B83D">↗</span></a>` : null}
</div>
<div style="flex: 999 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
<h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 600"><span>${v.ty.chTitle.typed}</span>${v.ty.chTitle.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.chTitle.rest}</span></h3>
<p style="margin: 0; font-size: 17px; line-height: 1.65; color: #B8BEC8"><span>${v.ty.chBody.typed}</span>${v.ty.chBody.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.chBody.rest}</span></p>
<div class=${v.stg.story} style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 10px">
${(v.ch.wins || []).map((w, $index) => html`
<div style="border: 1px solid #3A3220; background: #1C1810; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px">
<span style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #F5B83D">${w.n}</span>
<span style="font-size: 14px; color: #B8BEC8; line-height: 1.45">${w.l}</span>
</div>
`)}
</div>
${v.ch.hasProjects ? html`
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 12px">
${(v.ch.projects || []).map((q, $index) => html`
<div class="swap" style="border: 1px solid #262B36; background: #10131A; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 8px">
<span style="font-size: 12px; font-weight: 700; color: #5CC8E8">${q.when}</span>
<strong style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; line-height: 1.3">${q.name}</strong>
<span style="font-size: 14px; line-height: 1.55; color: #B8BEC8">${q.what}</span>
<span style="margin-top: auto; padding-top: 4px; font-size: 13px; font-weight: 700; color: #F5B83D">${q.metric}</span>
${q.hasGh ? html`<a href=${q.gh} target="_blank" rel="noopener" style="align-self: flex-start; margin-top: 4px; padding: 9px 14px; border-radius: 9px; background: #E8EAEE; color: #0B0D12; text-decoration: none; font-size: 13px; font-weight: 700">GitHub ↗</a>` : null}
</div>
`)}
</div>
` : null}
${v.ch.hasTools ? html`
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(v.ch.tools || []).map((x, $index) => html`<span style="padding: 6px 10px; border-radius: 8px; border: 1px solid #3A4150; font-size: 13px; color: #B8BEC8">${x}</span>`)}
</div>
` : null}
${v.ch.hasTable ? html`
<div class="swap" style="overflow-x: auto; border: 1px solid #262B36; border-radius: 14px">
<div role="table" aria-label=${v.ch.table.cap} style="min-width: 640px">
<div role="row" style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1.8fr; background: #10131A">${(v.ch.table.head || []).map((h, $index) => html`<span role="columnheader" style="padding: 12px 14px; color: #9AA1AD; font-size: 13px; font-weight: 600">${h}</span>`)}</div>
${(v.ch.table.rows || []).map((r, $index) => html`<div role="row" style="display: grid; grid-template-columns: 1.1fr 1fr 1fr 1fr 1.8fr; border-top: 1px solid #262B36">${(r.c || []).map((x, $index) => html`<span role="cell" style="padding: 12px 14px; color: #E8EAEE; font-size: 14px; font-weight: 600">${x}</span>`)}</div>`)}
</div>
<span style="display: block; padding: 10px 14px; font-size: 12px; color: #9AA1AD; border-top: 1px solid #262B36">${v.ch.table.cap}</span>
</div>
` : null}
<div style="display: flex; gap: 10px; margin-top: 8px">
<button onClick=${v.prevChapter} style="padding: 12px 18px; border-radius: 10px; border: 1px solid #3A4150; background: transparent; color: #E8EAEE; font-size: 14px; font-weight: 600; cursor: pointer">${v.t.prev}</button>
<button onClick=${v.nextChapter} style="padding: 12px 18px; border-radius: 10px; border: none; background: #E8EAEE; color: #0B0D12; font-size: 14px; font-weight: 700; cursor: pointer">${v.t.next}</button>
</div>
</div>
</article>
</section>


<section id="moment" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 56px 32px 40px">
<div style="max-width: 980px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 20px; align-items: start">
<figure style="margin: 0; display: flex; flex-direction: column; gap: 10px">
<img src="assets/img/graduation-1.jpg" alt="Abhinandan in graduation gown holding his M.Sc. certificate at IU International University of Applied Sciences" style="width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: contain; display: block; border-radius: 20px; border: 1px solid #262B36; background: #141821" />
<figcaption style="font-size: 13px; color: #9AA1AD">${v.t.cap1}</figcaption>
</figure>
<figure style="margin: 0; display: flex; flex-direction: column; gap: 10px">
<img src="assets/img/graduation-2.jpg" alt="Abhinandan at the graduation reception in Berlin" style="width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: contain; display: block; border-radius: 20px; border: 1px solid #262B36; background: #141821" />
<figcaption style="font-size: 13px; color: #9AA1AD">${v.t.cap2}</figcaption>
</figure>
</div>
<div style="margin-top: 20px; background: #F5B83D; color: #0B0D12; border-radius: 20px; padding: 40px 44px; display: flex; flex-wrap: wrap; gap: 20px 48px; align-items: center">
<p style="flex: 999 1 560px; min-width: 0; margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: clamp(24px, 5.5vw, 34px); line-height: 1.22; font-weight: 700; letter-spacing: -0.01em"><span>${v.ty.tagline.typed}</span>${v.ty.tagline.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.tagline.rest}</span></p>
<p style="flex: 1 1 300px; margin: 0; font-size: 16px; line-height: 1.6; color: #2A2312">${v.t.tagSub}</p>
</div>
</section>


<section id="work" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 96px 32px 40px">
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 28px">
<div style="display: flex; flex-direction: column; gap: 12px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.workEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 46px); letter-spacing: -0.02em"><span>${v.ty.workH2.typed}</span>${v.ty.workH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.workH2.rest}</span></h2>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(v.filters || []).map((f, $index) => html`
${f.active ? html`<button onClick=${f.pick} style="padding: 11px 16px; border-radius: 999px; border: none; background: #E8EAEE; color: #0B0D12; font-size: 14px; font-weight: 700; cursor: pointer">${f.label}</button>` : null}
${f.inactive ? html`<button onClick=${f.pick} style="padding: 11px 16px; border-radius: 999px; border: 1px solid #3A4150; background: transparent; color: #E8EAEE; font-size: 14px; font-weight: 600; cursor: pointer">${f.label}</button>` : null}
`)}
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 20px">
<div class=${v.stg.work} style="flex: 1 1 320px; display: flex; flex-direction: column; gap: 10px">
${(v.shown || []).map((p, $index) => html`
${p.active ? html`
<button onClick=${p.pick} style="text-align: left; padding: 18px 20px; border-radius: 14px; border: 1px solid #F5B83D; background: #2A2312; color: #E8EAEE; cursor: pointer; display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 700; color: ${p.fg}">${p.status} · ${p.tagLabel}</span><span style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600">${p.name}</span></button>
` : null}
${p.inactive ? html`
<button onClick=${p.pick} style="text-align: left; padding: 18px 20px; border-radius: 14px; border: 1px solid #262B36; background: #141821; color: #B8BEC8; cursor: pointer; display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 700; color: ${p.fg}">${p.status} · ${p.tagLabel}</span><span style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600">${p.name}</span></button>
` : null}
`)}
</div>
<article class="swap" style="flex: 999 1 560px; min-width: 0; background: #141821; border: 1px solid #262B36; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column">
${v.proj.playing ? html`
<iframe src=${v.proj.embed} title="${v.proj.name} — demo video" style="width: 100%; aspect-ratio: 16 / 9; border: 0; display: block; background: #000" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen="true"></iframe>
` : null}
${v.proj.showPlay ? html`
<button onClick=${v.proj.play} aria-label=${v.proj.videoLabel} style="width: 100%; aspect-ratio: 16 / 9; border: 0; cursor: pointer; background: #1A1F2A; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; position: relative; font-family: inherit">
<span style="width: 72px; height: 72px; border-radius: 50%; background: #F5B83D; color: #0B0D12; display: flex; align-items: center; justify-content: center; font-size: 24px" aria-hidden="true">▶</span>
<span style="font-size: 15px; color: #E8EAEE; font-weight: 600">${v.proj.videoLabel}</span>
<span style="position: absolute; left: 14px; bottom: 12px; font-size: 12px; color: #9AA1AD">${v.t.videoNote}</span>
</button>
` : null}
${v.proj.noVideo ? html`
<div style="aspect-ratio: 16 / 9; background: #1A1F2A; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px">
<span style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #3A4150; color: #9AA1AD; display: flex; align-items: center; justify-content: center; font-size: 20px" aria-hidden="true">▶</span>
<span style="font-size: 14px; color: #9AA1AD">${v.proj.videoLabel}</span>
</div>
` : null}
<div style="padding: 30px; display: flex; flex-direction: column; gap: 14px">
<h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 700">${v.proj.name}</h3>
<div style="display: flex; flex-direction: column; gap: 8px; font-size: 16px; line-height: 1.6; color: #B8BEC8">
<div><strong style="color: #E8EAEE">${v.t.problem} · </strong>${v.proj.problem}</div>
<div><strong style="color: #E8EAEE">${v.t.approach} · </strong>${v.proj.approach}</div>
<div><strong style="color: #E8EAEE">${v.proj.resultLabel} · </strong>${v.proj.result}</div>
</div>
${v.proj.diagram ? html`
<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 18px; border-radius: 14px; background: #10131A; border: 1px solid #262B36">
<span style="padding: 10px 12px; border-radius: 10px; border: 1px dashed #3A4150; font-size: 13px; color: #B8BEC8">news + inventory</span><span style="color: #5CC8E8" aria-hidden="true">→</span>
<span style="padding: 10px 12px; border-radius: 10px; border: 1px solid #5CC8E8; background: #1D2330; font-size: 13px; font-weight: 600">Watchtower</span><span style="color: #5CC8E8" aria-hidden="true">→</span>
<span style="padding: 10px 12px; border-radius: 10px; border: 1px solid #F5B83D; background: #2A2312; font-size: 13px; font-weight: 600">Supervisor</span><span style="color: #5CC8E8" aria-hidden="true">→</span>
<span style="padding: 10px 12px; border-radius: 10px; border: 1px solid #5CC8E8; background: #1D2330; font-size: 13px; font-weight: 600">Procurement</span><span style="color: #5CC8E8" aria-hidden="true">→</span>
<span style="padding: 10px 12px; border-radius: 10px; border: 1px solid #7EE2A8; background: #13261C; font-size: 13px; font-weight: 600">Human gate</span><span style="color: #5CC8E8" aria-hidden="true">→</span>
<span style="padding: 10px 12px; border-radius: 10px; border: 1px dashed #3A4150; font-size: 13px; color: #B8BEC8">supplier API (A2A)</span>
</div>
` : null}
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(v.proj.stack || []).map((x, $index) => html`<span style="padding: 6px 10px; border-radius: 8px; border: 1px solid #3A4150; font-size: 13px; color: #B8BEC8">${x}</span>`)}
</div>
<div style="display: flex; flex-wrap: wrap; gap: 10px; padding-top: 6px">
${(v.proj.links || []).map((k, $index) => html`
${k.primary ? html`<a href=${k.url} style="padding: 12px 18px; border-radius: 10px; background: #E8EAEE; color: #0B0D12; text-decoration: none; font-size: 14px; font-weight: 700">${k.label}</a>` : null}
${k.secondary ? html`<a href=${k.url} style="padding: 12px 18px; border-radius: 10px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-size: 14px; font-weight: 600">${k.label}</a>` : null}
`)}
</div>
</div>
</article>
</div>
</section>


<section id="research" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 96px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.resEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 44px); letter-spacing: -0.02em; max-width: 880px"><span>${v.ty.resH2.typed}</span>${v.ty.resH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.resH2.rest}</span></h2>
<p style="margin: 0; font-size: 16px; color: #9AA1AD; max-width: 760px; line-height: 1.6">${v.t.resNote}</p>
</div>
<div style="background: #141821; border: 1px solid #262B36; border-radius: 18px; padding: 24px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-wrap: wrap; gap: 8px">
${(v.bench.tabs || []).map((b, $index) => html`
${b.active ? html`<button onClick=${b.pick} aria-pressed="true" style="padding: 11px 16px; border-radius: 10px; border: 1px solid #F5B83D; background: #2A2312; color: #F5B83D; font-size: 14px; font-weight: 700; cursor: pointer">${b.label}</button>` : null}
${b.inactive ? html`<button onClick=${b.pick} aria-pressed="false" style="padding: 11px 16px; border-radius: 10px; border: 1px solid #262B36; background: #10131A; color: #B8BEC8; font-size: 14px; font-weight: 600; cursor: pointer">${b.label}</button>` : null}
`)}
</div>
<div style="overflow-x: auto">
<div role="table" aria-label="Benchmark" style="min-width: 640px; font-variant-numeric: tabular-nums">
<div role="row" style="display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr"><span role="columnheader" style="padding: 10px 12px; color: #9AA1AD; font-size: 14px; font-weight: 600">${v.t.benchModel}</span><span role="columnheader" style="padding: 10px 12px; color: #9AA1AD; font-size: 14px; font-weight: 600; text-align: right">BLEU ↑</span><span role="columnheader" style="padding: 10px 12px; color: #9AA1AD; font-size: 14px; font-weight: 600; text-align: right">chrF++ ↑</span><span role="columnheader" style="padding: 10px 12px; color: #9AA1AD; font-size: 14px; font-weight: 600; text-align: right">TER ↓</span><span role="columnheader" style="padding: 10px 12px; color: #9AA1AD; font-size: 14px; font-weight: 600; text-align: right">COMET ↑</span></div>
${(v.bench.rows || []).map((r, $index) => html`
<div role="row" class="swap" style="display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr; align-items: center; border-top: 1px solid #262B36">
<span role="cell" style="padding: 12px; color: #E8EAEE; font-size: 15px">${r.ours ? html`<span style="display: inline-block; margin-right: 8px; padding: 3px 7px; border-radius: 6px; background: #2A2312; color: #F5B83D; font-size: 11px; font-weight: 700">600M · OURS</span>` : null}${r.name}</span>
${(r.cells || []).map((x, $index) => html`
${x.best ? html`<span role="cell" style="padding: 12px; text-align: right; font-size: 15px"><span style="padding: 4px 8px; border-radius: 6px; background: #F5B83D; color: #0B0D12; font-weight: 700">${x.v}</span></span>` : null}
${x.plain ? html`<span role="cell" style="padding: 12px; text-align: right; color: #B8BEC8; font-size: 15px">${x.v}</span>` : null}
`)}
</div>
`)}
</div>
<span style="display: block; padding-top: 12px; font-size: 12px; color: #9AA1AD">${v.t.benchCap}</span>
</div>
<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #B8BEC8">${v.t.benchNote}</p>
</div>
<div style="display: flex; flex-direction: column; gap: 14px">
${(v.pubs || []).map((u, $index) => html`
<article style="background: #141821; border: 1px solid #262B36; border-radius: 16px; padding: 26px; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-wrap: wrap; gap: 16px 28px; align-items: center">
<span style="flex: 0 0 auto; padding: 8px 12px; border-radius: 8px; background: #2A2312; color: #F5B83D; font-size: 13px; font-weight: 700">${u.venue}</span>
<div style="flex: 999 1 460px; min-width: 0; display: flex; flex-direction: column; gap: 6px">
<h3 style="margin: 0; font-size: 18px; font-weight: 600; line-height: 1.45">${u.title}</h3>
<span style="font-size: 14px; color: #9AA1AD">${u.status}</span>
</div>
<button onClick=${u.toggle} aria-expanded=${u.open} style="padding: 11px 16px; border-radius: 10px; border: 1px solid #3A4150; background: transparent; color: #E8EAEE; font-size: 14px; font-weight: 600; cursor: pointer">${u.btn}</button>
</div>
${u.open ? html`
<div class="swap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 12px">
${(u.proof || []).map((f, $index) => html`
<button onClick=${f.open} style="text-align: left; cursor: pointer; padding: 18px; border-radius: 12px; background: #10131A; border: 1px solid #262B36; color: #E8EAEE; display: flex; gap: 14px; align-items: center">
<span style="flex: 0 0 auto; width: 40px; height: 40px; border-radius: 10px; background: #2A2312; color: #F5B83D; display: flex; align-items: center; justify-content: center; font-size: 16px" aria-hidden="true">${f.icon}</span>
<span style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0"><strong style="font-size: 15px">${f.label}</strong><span style="color: #9AA1AD; font-size: 13px">${f.sub}</span></span>
<span style="color: #F5B83D; font-size: 13px; font-weight: 600">${v.t.viewOpen} →</span>
</button>
`)}
</div>
<span style="font-size: 13px; font-weight: 700; color: #9AA1AD; letter-spacing: 0.06em; margin-top: 4px">${v.t.codeModels}</span>
<div class="swap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 12px">
${(u.assets || []).map((f, $index) => html`
<a href=${f.url} target="_blank" rel="noopener" style="text-decoration: none; padding: 18px; border-radius: 12px; background: #10131A; border: 1px solid #262B36; color: #E8EAEE; display: flex; gap: 14px; align-items: center">
<span style="flex: 0 0 auto; width: 40px; height: 40px; border-radius: 10px; background: #1D2330; color: #5CC8E8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700" aria-hidden="true">${f.icon}</span>
<span style="display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0"><strong style="font-size: 15px">${f.label}</strong><span style="color: #9AA1AD; font-size: 13px">${f.sub}</span></span>
<span style="color: #5CC8E8; font-size: 13px; font-weight: 600">↗</span>
</a>
`)}
</div>
` : null}
</article>
`)}
</div>
</section>


<section id="stack" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 96px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.stackEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 44px); letter-spacing: -0.02em"><span>${v.ty.stackH2.typed}</span>${v.ty.stackH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.stackH2.rest}</span></h2>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px">
${(v.stackTabs || []).map((s, $index) => html`
${s.active ? html`<button onClick=${s.pick} style="padding: 11px 15px; border-radius: 10px; border: 1px solid #F5B83D; background: #2A2312; color: #F5B83D; font-size: 14px; font-weight: 700; cursor: pointer">${s.h}</button>` : null}
${s.inactive ? html`<button onClick=${s.pick} style="padding: 11px 15px; border-radius: 10px; border: 1px solid #262B36; background: #141821; color: #B8BEC8; font-size: 14px; font-weight: 600; cursor: pointer">${s.h}</button>` : null}
`)}
</div>
${(v.stackTabs || []).map((s, $index) => html`
${s.active ? html`
<div class="swap" style="background: #141821; border: 1px solid #262B36; border-radius: 18px; padding: 28px; display: flex; flex-wrap: wrap; gap: 10px; min-height: 64px">
${(s.items || []).map((x, $index) => html`<span style="padding: 10px 14px; border-radius: 10px; background: #1D2330; color: #E8EAEE; font-size: 15px; font-weight: 500">${x}</span>`)}
</div>
` : null}
`)}
</section>


<section id="bring" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 96px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.bringEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 46px); letter-spacing: -0.02em"><span>${v.ty.bringH2.typed}</span>${v.ty.bringH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.bringH2.rest}</span></h2>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 20px">
<div role="tablist" aria-label="Capabilities" style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 10px">
${(v.caps || []).map((c, $index) => html`
${c.active ? html`
<button role="tab" aria-selected="true" onClick=${c.pick} style="text-align: left; padding: 20px 22px; border-radius: 14px; border: 1px solid #F5B83D; background: #2A2312; color: #E8EAEE; cursor: pointer; display: flex; gap: 14px; align-items: center"><span style="font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #F5B83D">${c.no}</span><span style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 600">${c.h}</span></button>
` : null}
${c.inactive ? html`
<button role="tab" aria-selected="false" onClick=${c.pick} style="text-align: left; padding: 20px 22px; border-radius: 14px; border: 1px solid #262B36; background: #141821; color: #B8BEC8; cursor: pointer; display: flex; gap: 14px; align-items: center"><span style="font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #9AA1AD">${c.no}</span><span style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 600">${c.h}</span></button>
` : null}
`)}
</div>
<div class="swap" role="tabpanel" style="flex: 999 1 520px; min-width: 0; background: #141821; border: 1px solid #262B36; border-radius: 20px; padding: 36px; display: flex; flex-direction: column; gap: 18px">
<h3 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700">${v.cap.h}</h3>
<p style="margin: 0; font-size: 17px; line-height: 1.65; color: #B8BEC8"><span>${v.ty.capProof.typed}</span>${v.ty.capProof.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.capProof.rest}</span></p>
<div style="display: flex; flex-direction: column; gap: 8px">
<span style="font-size: 13px; font-weight: 700; color: #9AA1AD; letter-spacing: 0.06em">${v.t.where}</span>
<span style="font-size: 16px; color: #E8EAEE">${v.cap.where}</span>
</div>
<div class=${v.stg.bring} style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto">
${(v.cap.tools || []).map((x, $index) => html`
<span style="padding: 7px 12px; border-radius: 8px; border: 1px solid #3A4150; font-size: 13px; color: #B8BEC8">${x}</span>
`)}
</div>
</div>
</div>
</section>


<section id="certs" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 72px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.certEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 44px); letter-spacing: -0.02em"><span>${v.ty.certH2.typed}</span>${v.ty.certH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.certH2.rest}</span></h2>
</div>
<div class=${v.stg.certs} style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(330px, 100%), 1fr)); gap: 14px">
${(v.certs || []).map((k, $index) => html`
<a href=${k.url} style="text-decoration: none; color: #E8EAEE; background: #141821; border: 1px solid #262B36; border-radius: 16px; padding: 22px; display: flex; gap: 16px; align-items: flex-start">
<span style="flex: 0 0 auto; width: 44px; height: 44px; border-radius: 10px; background: #2A2312; color: #F5B83D; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 14px">${k.mono}</span>
<span style="display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1">
<strong style="font-size: 16px; line-height: 1.4">${k.name}</strong>
<span style="font-size: 14px; color: #9AA1AD">${k.issuer}</span>
<span style="font-size: 13px; color: #F5B83D; font-weight: 600">${v.t.verify} ↗</span>
</span>
</a>
`)}
</div>
</section>


<section id="recs" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 72px 32px 40px">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px">
<span style="font-size: 14px; font-weight: 600; color: #5CC8E8; letter-spacing: 0.06em">${v.t.recsEyebrow}</span>
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 44px); letter-spacing: -0.02em"><span>${v.ty.recsH2.typed}</span>${v.ty.recsH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.recsH2.rest}</span></h2>
</div>
<div class=${v.stg.recs} style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px">
${(v.recs || []).map((r, $index) => html`
<figure style="margin: 0; background: #141821; border: 1px solid #262B36; border-radius: 18px; padding: 28px; display: flex; flex-direction: column; gap: 18px">
<span style="font-family: 'Space Grotesk', sans-serif; font-size: 48px; line-height: 0.6; color: #F5B83D; height: 22px" aria-hidden="true">“</span>
<blockquote lang="en" style="margin: 0; font-size: 16px; line-height: 1.65; color: #E8EAEE">${r.quote}</blockquote>
<figcaption style="margin-top: auto; display: flex; gap: 14px; align-items: center; padding-top: 14px; border-top: 1px solid #262B36">
<span style="flex: 0 0 auto; width: 44px; height: 44px; border-radius: 50%; background: #2A2312; color: #F5B83D; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 15px" aria-hidden="true">${r.initials}</span>
<span style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
<strong style="font-size: 15px; color: #E8EAEE">${r.name}</strong>
<span style="font-size: 13px; color: #9AA1AD; line-height: 1.45">${r.role}</span>
<span style="font-size: 12px; color: #5CC8E8; font-weight: 600">${r.rel}</span>
</span>
</figcaption>
</figure>
`)}
</div>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-top: 18px">
<span style="font-size: 12px; color: #9AA1AD">${v.t.recsNote}</span>
<a href="https://www.linkedin.com/in/abhinandan-samal/details/recommendations/" target="_blank" rel="noopener" style="padding: 11px 16px; border-radius: 10px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-size: 14px; font-weight: 600">${v.t.recsMore} ↗</a>
</div>
</section>


<section id="contact" class="reveal" style="max-width: 1200px; margin: 0 auto; padding: 80px 32px 72px">
<div style="border: 1px solid #F5B83D; border-radius: 24px; padding: 52px; display: flex; flex-wrap: wrap; gap: 32px; align-items: center">
<div style="flex: 999 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(30px, 7vw, 46px); letter-spacing: -0.02em; line-height: 1.05"><span>${v.ty.contactH2.typed}</span>${v.ty.contactH2.typing ? html`<span class="caret" aria-hidden="true"></span>` : null}<span style="color: transparent">${v.ty.contactH2.rest}</span></h2>
<p style="margin: 0; font-size: 17px; color: #B8BEC8">${v.t.contactP}</p>
</div>
<div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 12px">
<a href="mailto:abhinandan198@gmail.com" style="padding: 16px 20px; border-radius: 14px; background: #F5B83D; color: #0B0D12; text-decoration: none; font-weight: 700; font-size: 16px">abhinandan198@gmail.com</a>
<a href="https://www.linkedin.com/in/abhinandan-samal/" style="padding: 16px 20px; border-radius: 14px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-weight: 600; font-size: 16px">LinkedIn ↗</a>
<a href="https://github.com/abhinandansamal" style="padding: 16px 20px; border-radius: 14px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-weight: 600; font-size: 16px">GitHub ↗</a>
<a href="https://huggingface.co/abhinandansamal" style="padding: 16px 20px; border-radius: 14px; border: 1px solid #3A4150; color: #E8EAEE; text-decoration: none; font-weight: 600; font-size: 16px">Hugging Face ↗</a>
</div>
</div>
<footer style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding-top: 28px; font-size: 13px; color: #9AA1AD">
<span>${v.t.footer}</span>
<span style="display: flex; gap: 6px"><button onClick=${v.openImprint} style="padding: 10px 8px; border: none; background: transparent; color: #9AA1AD; text-decoration: underline; font-size: 13px; cursor: pointer">Impressum</button><button onClick=${v.openPrivacy} style="padding: 10px 8px; border: none; background: transparent; color: #9AA1AD; text-decoration: underline; font-size: 13px; cursor: pointer">${v.t.privacy}</button></span>
</footer>
</section>


${v.lg.open ? html`
<div class="swap" role="dialog" aria-modal="true" aria-label=${v.lg.title} style="position: fixed; inset: 0; z-index: 50; background: rgba(5,6,9,0.9); display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box">
<div style="width: 100%; max-width: 760px; max-height: 100%; background: #141821; border: 1px solid #262B36; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden">
<div style="display: flex; align-items: center; gap: 16px; padding: 22px 28px; border-bottom: 1px solid #262B36">
<strong style="flex: 1; font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #E8EAEE">${v.lg.title}</strong>
<button onClick=${v.lg.close} aria-label="Close" style="padding: 10px 14px; border-radius: 10px; border: 1px solid #3A4150; background: #10131A; color: #E8EAEE; font-size: 14px; font-weight: 600; cursor: pointer">✕ ${v.t.viewClose}</button>
</div>
<div style="overflow-y: auto; padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 18px">
${(v.lg.sections || []).map((g, $index) => html`
<div style="display: flex; flex-direction: column; gap: 6px">
<strong style="font-size: 16px; color: #E8EAEE">${g.h}</strong>
<p style="margin: 0; font-size: 15px; line-height: 1.65; color: #B8BEC8; white-space: pre-line">${g.p}</p>
</div>
`)}
<span style="font-size: 12px; color: #9AA1AD">${v.lg.updated}</span>
</div>
</div>
</div>
` : null}


${v.vw.open ? html`
<div class="swap" role="dialog" aria-modal="true" aria-label=${v.vw.title} style="position: fixed; inset: 0; z-index: 50; background: rgba(5,6,9,0.92); display: flex; flex-direction: column; gap: 14px; padding: 18px 24px; box-sizing: border-box">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px">
<div style="flex: 1 1 320px; min-width: 0; display: flex; flex-direction: column; gap: 2px">
<strong style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #E8EAEE">${v.vw.title}</strong>
<span style="font-size: 13px; color: #9AA1AD">${v.vw.sub}</span>
</div>
${v.vw.multi ? html`<span style="font-size: 14px; color: #B8BEC8; font-variant-numeric: tabular-nums">${v.vw.counter}</span>` : null}
${v.vw.hasFile ? html`<a href=${v.vw.file} download="" style="padding: 11px 16px; border-radius: 10px; background: #F5B83D; color: #0B0D12; text-decoration: none; font-size: 14px; font-weight: 700">${v.t.download} ↓</a>` : null}
<button onClick=${v.vw.close} aria-label="Close viewer" style="padding: 11px 16px; border-radius: 10px; border: 1px solid #3A4150; background: #141821; color: #E8EAEE; font-size: 14px; font-weight: 600; cursor: pointer">✕ ${v.t.viewClose}</button>
</div>
<div style="flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; gap: 14px">
${v.vw.multi ? html`<button onClick=${v.vw.prev} aria-label="Previous page" style="flex: 0 0 auto; width: 48px; height: 48px; border-radius: 50%; border: 1px solid #3A4150; background: #141821; color: #E8EAEE; font-size: 18px; cursor: pointer">←</button>` : null}
${v.vw.hasPages ? html`
<img src=${v.vw.src} alt=${v.vw.alt} style="max-width: calc(100% - 140px); max-height: calc(100vh - 150px); object-fit: contain; border-radius: 8px; background: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.5)" />
` : null}
${v.vw.pending ? html`
<div style="max-width: 560px; background: #141821; border: 1px solid #262B36; border-radius: 18px; padding: 36px; display: flex; flex-direction: column; gap: 14px">
<strong style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; color: #E8EAEE">${v.t.pendingH}</strong>
<p style="margin: 0; font-size: 15px; line-height: 1.6; color: #B8BEC8">${v.t.pendingP}</p>
<a href="mailto:abhinandan198@gmail.com?subject=ICICoS%202026%20paper" style="align-self: flex-start; padding: 12px 18px; border-radius: 10px; background: #F5B83D; color: #0B0D12; text-decoration: none; font-weight: 700; font-size: 14px">${v.t.pendingBtn}</a>
</div>
` : null}
${v.vw.multi ? html`<button onClick=${v.vw.next} aria-label="Next page" style="flex: 0 0 auto; width: 48px; height: 48px; border-radius: 50%; border: 1px solid #3A4150; background: #141821; color: #E8EAEE; font-size: 18px; cursor: pointer">→</button>` : null}
</div>
</div>
` : null}

</div>`;
};

render(html`<${App} />`, document.getElementById('app'));
