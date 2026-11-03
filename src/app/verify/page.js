"use client";
import {useEffect,useState} from "react";
import {createClient} from "@supabase/supabase-js";

const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function VerifySalarySlip(){
 const [status,setStatus]=useState("loading");
 const [record,setRecord]=useState(null);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  const id=new URLSearchParams(window.location.search).get("id");
  if(!id){setStatus("invalid");setMessage("No document ID was provided.");return;}
  let active=true;
  supabase.rpc("verify_salary_slip",{p_document_id:id}).then(({data,error})=>{
   if(!active)return;
   if(error){setStatus("error");setMessage("Verification service is temporarily unavailable. Please contact Crescent HR.");return;}
   const row=Array.isArray(data)?data[0]:data;
   if(!row){setStatus("invalid");setMessage("This document ID is not registered in Crescent Payroll.");return;}
   setRecord(row);setStatus(row.is_valid?"valid":"revoked");
  });
  return ()=>{active=false;};
 },[]);
 const money=value=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value||0));
 return <main style={{minHeight:"100vh",background:"#f3f6fa",padding:"36px 16px",fontFamily:"Arial,sans-serif",color:"#152238"}}>
  <section style={{maxWidth:680,margin:"0 auto",background:"#fff",border:"1px solid #d4deea",borderRadius:14,padding:28,boxShadow:"0 8px 30px rgba(20,40,70,.08)"}}>
   <div style={{textAlign:"center",marginBottom:22}}><img src="/crescent-logo.svg" alt="Crescent Contractors Pvt. Ltd." style={{width:290,maxWidth:"90%",maxHeight:90,objectFit:"contain"}}/><h1 style={{fontSize:24,margin:"16px 0 4px"}}>Salary Slip Verification</h1><p style={{margin:0,color:"#65758a"}}>Crescent Contractors Pvt. Ltd.</p></div>
   {status==="loading"&&<p style={{textAlign:"center",padding:24}}>Checking document authenticity…</p>}
   {status==="valid"&&record&&<><div style={{background:"#e8f7ee",border:"1px solid #8ac9a0",borderRadius:9,padding:16,textAlign:"center",color:"#176534",fontWeight:700,fontSize:19}}>✓ Valid Crescent Salary Slip</div><p style={{textAlign:"center",color:"#52657b"}}>This document ID is registered in Crescent Payroll.</p><dl style={{display:"grid",gridTemplateColumns:"minmax(130px, .8fr) 1.2fr",gap:"12px 18px",marginTop:24,fontSize:15}}>{[["Document ID",record.document_id],["Employee",record.employee_name],["Staff ID",record.staff_id],["Salary Month",record.salary_month],["Net Payable",money(record.net_payable)],["Issued On",new Date(record.issued_at).toLocaleString("en-IN")]].map(([k,v])=><div key={k} style={{display:"contents"}}><dt style={{color:"#65758a"}}>{k}</dt><dd style={{margin:0,fontWeight:600,overflowWrap:"anywhere"}}>{v}</dd></div>)}</dl><p style={{fontSize:12,color:"#65758a",marginTop:24}}>This verification confirms the document ID and recorded payroll details. Compare the employee, month and net payable shown here with the submitted salary slip.</p></>}
   {status==="revoked"&&<div style={{background:"#fff4e5",border:"1px solid #e8bd7c",borderRadius:9,padding:18,color:"#8b4c00",textAlign:"center"}}><b>Document revoked</b><p style={{marginBottom:0}}>This salary slip is no longer valid. Contact Crescent HR.</p></div>}
   {(status==="invalid"||status==="error")&&<div style={{background:"#fff0f0",border:"1px solid #e6a3a3",borderRadius:9,padding:18,color:"#9b2424",textAlign:"center"}}><b>{status==="invalid"?"Invalid or unregistered document":"Unable to verify document"}</b><p style={{marginBottom:0}}>{message}</p></div>}
   <div style={{borderTop:"1px solid #e0e6ee",marginTop:26,paddingTop:16,textAlign:"center",fontSize:12,color:"#748398"}}>Official Crescent Payroll Verification · Generated through Crescent Payroll Software</div>
  </section>
 </main>;
}
