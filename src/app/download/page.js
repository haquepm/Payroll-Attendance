import Link from "next/link";

export const metadata = {
  title: "Crescent Contractors | Secure Salary Slip Download",
  description: "Official secure salary slip download from Crescent Contractors Pvt. Ltd.",
  openGraph: {
    title: "Crescent Contractors – Salary Slip",
    description: "Your official salary slip is ready. Open this secure Crescent Contractors page to download your PDF.",
    siteName: "Crescent Contractors",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Crescent Contractors – Salary Slip",
    description: "Secure salary slip download from Crescent Contractors Pvt. Ltd."
  }
};

export default async function SalarySlipDownloadPage({ searchParams }) {
  const params = await searchParams;
  const id = String(params?.id || "");
  const valid = /^CCSL-\d{6}-[A-F0-9]{12}$/.test(id);
  const downloadHref = valid ? "/api/payslip-download?id=" + encodeURIComponent(id) : "#";
  const verifyHref = valid ? "/verify?id=" + encodeURIComponent(id) : "#";
  return (
    <main style={{ minHeight: "100vh", background: "#f2f5f9", padding: "36px 16px", fontFamily: "Arial,sans-serif", color: "#152238" }}>
      <section style={{ maxWidth: 620, margin: "0 auto", background: "#fff", border: "1px solid #d6e0ea", borderRadius: 16, padding: 30, textAlign: "center", boxShadow: "0 10px 32px rgba(18,40,75,.08)" }}>
        <img src="/crescent-logo.png" alt="Crescent Contractors Pvt. Ltd." style={{ width: 300, maxWidth: "90%", maxHeight: 100, objectFit: "contain" }} />
        <p style={{ color: "#d39b2e", fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "22px 0 6px" }}>CRESCENT CONTRACTORS PVT. LTD.</p>
        <h1 style={{ fontSize: 25, margin: "0 0 8px" }}>Your Salary Slip Is Ready</h1>
        <p style={{ color: "#63748a", margin: "0 0 24px" }}>Secure PDF delivery from Crescent Contractors.</p>
        {valid ? (
          <>
            <div style={{ background: "#f2f7fd", border: "1px solid #d7e3f1", borderRadius: 9, padding: 12, fontSize: 13, overflowWrap: "anywhere", marginBottom: 20 }}>
              <b>Document ID</b><br />{id}
            </div>
            <a href={downloadHref} style={{ display: "inline-block", background: "#d5a84e", color: "#101820", borderRadius: 9, padding: "15px 28px", fontWeight: 700, textDecoration: "none", fontSize: 17 }}>⬇ Download Salary Slip (PDF)</a>
            <p style={{ margin: "20px 0 0", fontSize: 14 }}><Link href={verifyHref} style={{ color: "#175a9b" }}>Verify document authenticity</Link></p>
          </>
        ) : (
          <p style={{ color: "#a12626" }}>This salary slip link is invalid. Please contact Crescent HR for a new link.</p>
        )}
        <p style={{ borderTop: "1px solid #e2e8ef", paddingTop: 18, marginTop: 28, color: "#718096", fontSize: 12 }}>Official Crescent Payroll · payroll.crescentcontractors.com</p>
      </section>
    </main>
  );
}
