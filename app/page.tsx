import PhoneScene from "../components/PhoneScene";

type Row = { label: string; value: string; source: "Widely reported" | "Single report" | "Disputed" };

const specs: Row[] = [
  { label: "Display", value: "6.9-inch", source: "Single report" },
  { label: "Dimensions", value: "163.76 × 78.25 × 7.97 mm", source: "Single report" },
  { label: "Chip", value: "Snapdragon 8 Elite Extreme Gen 6", source: "Widely reported" },
  { label: "Memory", value: "12GB RAM or more", source: "Widely reported" },
  { label: "Storage", value: "256GB or more", source: "Widely reported" },
  { label: "Main camera", value: "200MP with OIS", source: "Widely reported" },
  { label: "Ultrawide camera", value: "50MP with autofocus", source: "Widely reported" },
  { label: "Telephoto camera", value: "50MP, 5x optical zoom, OIS", source: "Widely reported" },
  { label: "Rear camera count", value: "Three (one outlet reports four)", source: "Disputed" },
  { label: "Battery", value: "5,700mAh", source: "Widely reported" },
  { label: "Charging", value: "60W wired, 25W Qi2 wireless", source: "Single report" },
  { label: "Software", value: "One UI 9.5", source: "Single report" },
  { label: "Launch window", value: "Early 2027", source: "Widely reported" },
];

const dims = [
  { name: "Height", s26: 163.6, s27: 163.76 },
  { name: "Width", s26: 78.1, s27: 78.25 },
  { name: "Thickness", s26: 7.9, s27: 7.97 },
];

const lenses = [
  { big: "200MP", title: "Main", text: "A new 200MP sensor with optical stabilization anchors the setup." },
  { big: "50MP", title: "Ultrawide", text: "Reported to gain autofocus, which helps with close-ups." },
  { big: "5x", title: "Telephoto", text: "A 50MP periscope lens with 5x optical zoom and stabilization." },
];

const nav = [
  ["Design", "#design"],
  ["Camera", "#camera"],
  ["Power", "#power"],
  ["Specs", "#specs"],
  ["Launch", "#launch"],
];

export default function Home() {
  return (
    <>
      <PhoneScene />
      <header className="nav">
        <a href="#top" className="brand">S27 Ultra</a>
        <nav aria-label="Sections">
          {nav.map(([name, href]) => (
            <a key={href} href={href}>{name}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        <section id="hero" className="hero">
          <p className="tag">Unofficial concept based on leaks and rumors</p>
          <h1>Galaxy S27 Ultra</h1>
          <p className="lead">
            A new horizontal camera bar, a bigger battery and a faster chip. Here is what has been reported so far,
            and how well each claim is sourced.
          </p>
        </section>

        <section id="design" className="sec scene">
          <h2>Same size, new face</h2>
          <p className="lead">
            Samsung is said to replace its vertical lens rings with one wide camera bar across the back. The body
            stays almost the same size as the Galaxy S26 Ultra.
          </p>
          <div className="dims">
            {dims.map((d) => (
              <div key={d.name} className="dim">
                <h3>{d.name}</h3>
                <p className="num">{d.s27} mm</p>
                <p className="muted">S26 Ultra: {d.s26} mm (+{(d.s27 - d.s26).toFixed(2)} mm)</p>
              </div>
            ))}
          </div>
        </section>

        <section id="camera" className="sec scene">
          <h2>Three cameras, each with a clear job</h2>
          <p className="lead">
            If the leaks are right, the 10MP 3x lens is gone. It would be the first Ultra with fewer than four rear
            cameras since 2021.
          </p>
          <div className="lens-grid">
            {lenses.map((l) => (
              <article key={l.title} className="lens-card">
                <p className="big">{l.big}</p>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="power" className="sec scene">
          <h2>More battery, faster charging</h2>
          <div className="power">
            <div>
              <p className="big">5,700mAh</p>
              <p className="muted">Reported battery capacity</p>
            </div>
            <div>
              <p className="big">60W</p>
              <p className="muted">Reported wired charging</p>
            </div>
            <div>
              <p className="big">25W</p>
              <p className="muted">Reported Qi2 wireless charging</p>
            </div>
          </div>
          <p className="lead">
            It is expected to run Snapdragon 8 Elite Extreme Gen 6 with at least 12GB of RAM and One UI 9.5.
          </p>
        </section>

        <section id="specs" className="sec">
          <h2>Full rumored spec sheet</h2>
          <p className="lead">None of this is confirmed by Samsung. Each line shows how many reports back it up.</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Rumored detail</th>
                  <th scope="col">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>{r.value}</td>
                    <td>
                      <span className={`pill ${r.source === "Widely reported" ? "ok" : r.source === "Disputed" ? "warn" : ""}`}>
                        {r.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="launch" className="sec scene">
          <h2>When to expect it</h2>
          <p className="lead">
            Samsung usually unveils its S-series flagships in late winter, so an announcement in early 2027 is the
            most likely window. Reports also point to a price increase, but no figure has been confirmed.
          </p>
        </section>
      </main>

      <footer className="foot">
        <p>
          This is an unofficial fan concept. It is not affiliated with or endorsed by Samsung. All specifications are
          rumors and may change before launch.
        </p>
      </footer>
    </>
  );
}