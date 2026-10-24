/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Copy, Check, ShieldCheck, 
  Download, Printer, AlertTriangle, FileText, Landmark, 
  Clock, ArrowRight, Sparkles, PhoneCall, UploadCloud, 
  HelpCircle, RefreshCw, ChevronRight, User, Search
} from 'lucide-react';
import { PaymentRecord } from '../types';

interface PaymentViewProps {
  payments: PaymentRecord[];
  onAddPayment: (paymentData: Omit<PaymentRecord, 'id' | 'referenceNumber' | 'createdAt' | 'status'> & { status?: PaymentRecord['status']; referenceNumber?: string }) => PaymentRecord;
}

export default function PaymentView({ payments, onAddPayment }: PaymentViewProps) {
  // Official Account Details
  const ACCOUNT_DETAILS = {
    bankName: 'United Bank for Africa (UBA)',
    accountNumber: '1027146728',
    accountName: 'Holy Ghost Academy',
    accountType: 'Corporate / School Current Account',
    branch: 'Kamali / Ngozika Estate Branch, Awka, Anambra State',
    currency: 'NGN (₦ - Nigerian Naira)',
    ussdCode: '*919*4*1027146728*AMOUNT#'
  };

  // State management
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pay' | 'schedule' | 'status'>('pay');
  const [feeCategory, setFeeCategory] = useState<'jss' | 'ss' | 'admission' | 'projects'>('jss');
  
  // Payment Form States
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classLevel, setClassLevel] = useState('SS 2');
  const [purpose, setPurpose] = useState('School Fees / Tuition');
  const [amount, setAmount] = useState<number | ''>(75000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UBA Direct Bank Transfer');
  const [bankReference, setBankReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentRecord | null>(null);

  // Status Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Copy Account Number Helper
  const handleCopyAccount = () => {
    navigator.clipboard.writeText(ACCOUNT_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Image Upload Handler
  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Proof receipt image must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProofImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Form Submit Handler
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || !payerPhone.trim() || !studentName.trim() || !amount || Number(amount) <= 0) {
      alert('Please fill in all required payment details including payer name, phone number, student name, and amount.');
      return;
    }

    setIsSubmitting(true);

    const newPaymentRecord = onAddPayment({
      payerName: payerName.trim(),
      payerPhone: payerPhone.trim(),
      payerEmail: payerEmail.trim() || 'Not Provided',
      studentName: studentName.trim(),
      studentId: studentId.trim() || undefined,
      classLevel,
      purpose,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      bankReference: bankReference.trim() || `UBA-REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      proofImageUrl: proofImage || undefined,
      remarks: remarks.trim() || undefined,
      status: 'Pending Verification'
    });

    setIsSubmitting(false);
    setGeneratedReceipt(newPaymentRecord);
  };

  // Reset form to make another payment
  const handleResetForm = () => {
    setGeneratedReceipt(null);
    setPayerName('');
    setPayerPhone('');
    setPayerEmail('');
    setStudentName('');
    setStudentId('');
    setBankReference('');
    setRemarks('');
    setProofImage(null);
    setAmount(75000);
  };

  // Print Slip handler
  const handlePrintSlip = () => {
    window.print();
  };

  // Quick Amount preset chips
  const amountPresets = [
    { label: 'Admission Form (₦10,000)', val: 10000, purp: 'Admission & Application Form' },
    { label: 'JSS Tuition (₦35,000)', val: 35000, purp: 'School Fees / Tuition' },
    { label: 'SS Tuition (₦35,000)', val: 35000, purp: 'School Fees / Tuition' },
    { label: 'PTA Levy (₦5,000)', val: 5000, purp: 'PTA Levy' },
    { label: 'Lab Upgrade Fund (₦20,000)', val: 20000, purp: 'Diocesan Project Donation' },
  ];

  const filteredPayments = payments.filter(p => 
    p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.studentId && p.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.bankReference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans text-gray-700 bg-slate-50 min-h-[85vh] pb-16">
      
      {/* 1. HERO HEADER */}
      <section className="bg-brand-oxblood text-white py-8 md:py-10 border-b-4 border-brand-green relative overflow-hidden no-print">
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-2 text-center">
          <div className="inline-flex items-center space-x-1.5 bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-brand-yellow/30">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Official Church Payment Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight uppercase">
            School Fees &amp; Bank Payment Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            Make direct bank transfers, submit payment receipts, verify terminal school fee reconciliations, and contribute to school development projects.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* PROMINENT UBA BANK ACCOUNT HIGHLIGHT CARD */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-red-50/40 rounded-xl border-2 border-red-200/80 shadow-md p-5 sm:p-7 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Bank Card Visual Design */}
            <div className="lg:col-span-6 bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden border border-red-700/50">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Landmark className="w-28 h-28 text-white" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-brand-yellow inline-block animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-red-200">
                      OFFICIAL DESIGNATED BANK
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading mt-0.5">
                    United Bank for Africa (UBA)
                  </h3>
                </div>
                <span className="bg-white/15 px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/20">
                  Direct Transfer
                </span>
              </div>

              {/* Account Number Box */}
              <div className="space-y-1.5 my-4 relative z-10">
                <span className="text-[10px] uppercase font-bold text-red-200 tracking-wider">Account Number</span>
                <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-xs px-4 py-3 rounded-lg border border-white/15">
                  <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-brand-yellow select-all">
                    1027146728
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="ml-auto bg-brand-yellow hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                    title="Click to copy account number"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-800" />
                        <span className="text-green-900 font-black">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Account Name & Branch Details */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs relative z-10">
                <div>
                  <span className="text-[9px] uppercase font-bold text-red-300 block">Account Name</span>
                  <span className="font-bold text-white uppercase tracking-wide">Holy Ghost Academy</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-red-300 block">Account Type</span>
                  <span className="font-semibold text-slate-200">School Corporate</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Security Advisory */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                  <h4 className="font-bold text-base text-gray-900 font-heading uppercase">
                    Direct Payment Instructions
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parents, guardians, prospective applicants, and well-wishers can make tuition, admission, or project payments directly using online banking apps, bank branch tellers, or USSD codes into the designated <strong>UBA Corporate Account: 1027146728 (Holy Ghost Academy)</strong>.
                </p>
              </div>

              {/* USSD Shortcut Box */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center">
                    <PhoneCall className="w-3.5 h-3.5 mr-1 text-red-600" />
                    UBA USSD Quick Dial Code
                  </span>
                  <span className="text-[10px] text-brand-green font-bold">Fast Mobile Transfer</span>
                </div>
                <div className="bg-slate-100 p-2.5 rounded font-mono text-xs text-slate-800 flex items-center justify-between border border-slate-200">
                  <span className="font-bold">*919*4*1027146728*Amount#</span>
                  <span className="text-[9.5px] text-slate-500 bg-white px-2 py-0.5 rounded border">UBA Users</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  For other banks (GTBank, Zenith, FirstBank, Access), transfer directly using your bank app to <strong>UBA - 1027146728 (Holy Ghost Academy)</strong>.
                </p>
              </div>

              {/* Security Advisory alert */}
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-lg flex items-start space-x-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Fraud Prevention Warning:</strong> Holy Ghost Academy Awka accepts payments <em>ONLY</em> to the designated UBA Account <strong>1027146728 (Holy Ghost Academy)</strong>. Do not transfer funds to any personal accounts.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 3. SECTION NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6 no-print">
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'pay'
                ? 'bg-brand-green text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Submit Payment Proof / Generate Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-brand-oxblood text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Approved Fees Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'status'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Payment / View Receipts</span>
          </button>
        </div>

        {/* 4. TAB CONTENT 1: MAKE PAYMENT / SUBMIT PROOF FORM OR RECEIPT */}
        {activeTab === 'pay' && (
          <div className="space-y-6">
            
            {/* If Receipt Generated, Show Official Digital Slip */}
            {generatedReceipt ? (
              <div className="bg-white rounded-xl border-2 border-brand-green/30 shadow-lg p-6 sm:p-8 space-y-6 animate-fade-in print:p-0 print:border-none print:shadow-none">
                
                {/* Top Success Banner */}
                <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Payment Confirmation Submitted Successfully!</h4>
                      <p className="text-xs text-green-700">Your electronic payment reference is <strong>{generatedReceipt.referenceNumber}</strong>. Print or save this acknowledgment slip.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrintSlip}
                      className="bg-brand-green hover:bg-brand-green-dark text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                    >
                      Make Another Payment
                    </button>
                  </div>
                </div>

                {/* THE OFFICIAL PRINTABLE RECEIPT CARD */}
                <div className="border-4 border-double border-slate-300 p-6 sm:p-8 rounded-lg bg-slate-50/50 space-y-6 max-w-3xl mx-auto">
                  
                  {/* Header of Slip */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-yellow shrink-0 shadow-xs bg-white">
                        <img
                          src="https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg"
                          alt="Holy Ghost Academy Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xl sm:text-2xl font-black font-heading text-brand-oxblood uppercase tracking-tight">
                          Holy Ghost Academy
                        </h3>
                        <p className="text-xs font-bold text-brand-green uppercase tracking-widest">
                          Secondary School, Awka, Anambra State
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ngozika Housing Estate, Awka • holyghostacademy@gmail.com • 07068986865, 09054145339
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <span className="inline-block bg-brand-green text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                        E-Receipt Acknowledgment
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-900">
                        REF: {generatedReceipt.referenceNumber}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Date: {generatedReceipt.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Beneficiary Badge */}
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-800 block">Designated Recipient Account</span>
                      <span className="font-bold text-slate-900">United Bank for Africa (UBA) • 1027146728 (Holy Ghost Academy)</span>
                    </div>
                    <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">
                      {generatedReceipt.status}
                    </span>
                  </div>

                  {/* Payment Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 bg-white p-3.5 rounded border border-slate-200">
                      <h5 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] border-b pb-1">Payer Details</h5>
                      <p><strong>Payer Name:</strong> {generatedReceipt.payerName}</p>
                      <p><strong>Phone Number:</strong> {generatedReceipt.payerPhone}</p>
                      <p><strong>Email Address:</strong> {generatedReceipt.payerEmail}</p>
                      <p><strong>Payment Channel:</strong> {generatedReceipt.paymentMethod}</p>
                    </div>

                    <div className="space-y-2 bg-white p-3.5 rounded border border-slate-200">
                      <h5 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] border-b pb-1">Student & Fee Purpose</h5>
                      <p><strong>Student Name:</strong> {generatedReceipt.studentName}</p>
                      {generatedReceipt.studentId && <p><strong>Reg ID:</strong> {generatedReceipt.studentId}</p>}
                      <p><strong>Class Level:</strong> {generatedReceipt.classLevel}</p>
                      <p><strong>Payment Purpose:</strong> {generatedReceipt.purpose}</p>
                    </div>
                  </div>

                  {/* Amount Breakdown Box */}
                  <div className="bg-white p-4 rounded border border-slate-300 space-y-2">
                    <div className="flex justify-between items-center text-sm sm:text-base font-bold text-slate-900 border-b pb-2">
                      <span>Total Amount Remitted:</span>
                      <span className="text-xl sm:text-2xl font-black text-brand-green font-mono">
                        ₦{Number(generatedReceipt.amount).toLocaleString('en-NG')}.00
                      </span>
                    </div>
                    <div className="grid grid-cols-2 text-[10.5px] text-slate-500 pt-1">
                      <div>
                        <strong>Bank Transaction Ref / Teller:</strong> {generatedReceipt.bankReference}
                      </div>
                      <div className="text-right">
                        <strong>Payment Date:</strong> {generatedReceipt.paymentDate}
                      </div>
                    </div>
                    {generatedReceipt.remarks && (
                      <p className="text-[11px] text-slate-600 pt-1 italic">
                        <strong>Narration / Remarks:</strong> {generatedReceipt.remarks}
                      </p>
                    )}
                  </div>

                  {/* Footer Seal & Verification Note */}
                  <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 space-y-2 sm:space-y-0">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="font-bold text-slate-700">Holy Ghost Academy Bursary Department</p>
                      <p>This electronic slip serves as temporary confirmation pending bank clearance.</p>
                    </div>
                    <div className="text-center sm:text-right border border-dashed border-slate-400 p-2 rounded bg-white">
                      <span className="font-mono uppercase font-bold text-slate-700">OFFICIAL RECONCILIATION SEAL</span>
                    </div>
                  </div>

                </div>

                {/* Print button at bottom */}
                <div className="text-center pt-2 no-print">
                  <button
                    type="button"
                    onClick={handlePrintSlip}
                    className="bg-brand-green hover:bg-brand-green-dark text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Receipt Slip</span>
                  </button>
                </div>

              </div>
            ) : (
              /* PAYMENT SUBMISSION FORM */
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                <div className="space-y-1 border-b pb-4">
                  <h3 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-brand-green" />
                    Payment Confirmation & Receipt Submitter
                  </h3>
                  <p className="text-xs text-slate-500">
                    After making a transfer or bank deposit to <strong>UBA Account 1027146728 (Holy Ghost Academy)</strong>, fill in the transaction details below to receive your immediate electronic acknowledgment slip and notify the bursary.
                  </p>
                </div>

                {/* Preset Amount Chips for Convenience */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Select Fee Preset (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amountPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAmount(preset.val);
                          setPurpose(preset.purp);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
                          amount === preset.val && purpose === preset.purp
                            ? 'bg-brand-green text-white border-brand-green font-bold shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  
                  {/* Section 1: Payer Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-brand-oxblood uppercase tracking-wider border-b pb-1">
                      1. Payer / Guardian Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Payer Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mrs. Ngozi Ezeokafor"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0803 123 4567"
                          value={payerPhone}
                          onChange={(e) => setPayerPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Email Address (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. parent@gmail.com"
                          value={payerEmail}
                          onChange={(e) => setPayerEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Student & Class Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-brand-oxblood uppercase tracking-wider border-b pb-1">
                      2. Student & Class Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Student Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chinedu Okafor"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Student Registration ID (If Enrolled)</label>
                        <input
                          type="text"
                          placeholder="e.g. HGASS/2026/001"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Class Level / Category *</label>
                        <select
                          value={classLevel}
                          onChange={(e) => setClassLevel(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        >
                          <option value="JSS 1">Junior Secondary 1 (JSS 1)</option>
                          <option value="JSS 2">Junior Secondary 2 (JSS 2)</option>
                          <option value="JSS 3">Junior Secondary 3 (JSS 3)</option>
                          <option value="SS 1">Senior Secondary 1 (SS 1)</option>
                          <option value="SS 2">Senior Secondary 2 (SS 2)</option>
                          <option value="SS 3">Senior Secondary 3 (SS 3)</option>
                          <option value="Prospective Student">Prospective Student (Admission Applicant)</option>
                          <option value="Alumnus / Donor">Alumnus / Friend of the Academy</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Remittance Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-brand-oxblood uppercase tracking-wider border-b pb-1">
                      3. Transaction & Remittance Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Payment Purpose *</label>
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        >
                          <option value="School Fees / Tuition">School Fees / Tuition</option>
                          <option value="Admission & Application Form">Admission & Application Form</option>
                          <option value="PTA Levy">PTA Levy & Development Dues</option>
                          <option value="Uniform & Textbooks">School Uniform & Books</option>
                          <option value="WAEC / NECO Registration">WAEC / NECO Exam Fees</option>
                          <option value="Diocesan Project Donation">Diocesan Project Support / Donation</option>
                          <option value="Other">Other Specific Fee</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Amount Paid (₦ Naira) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₦</span>
                          <input
                            type="number"
                            required
                            min="500"
                            placeholder="75000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Payment Method *</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        >
                          <option value="UBA Direct Bank Transfer">UBA Direct Bank Transfer</option>
                          <option value="Mobile Banking App">Mobile Banking App (Other Bank to UBA)</option>
                          <option value="USSD Transfer">USSD Transfer (*919# / *737# etc.)</option>
                          <option value="Bank Branch Teller Deposit">In-Branch Teller Deposit</option>
                          <option value="POS / ATM Transfer">POS / ATM Card Transfer</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Bank Reference / Teller Slip No. *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. UBA/TRX/98127361 or Teller 4421"
                          value={bankReference}
                          onChange={(e) => setBankReference(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Date of Payment *</label>
                        <input
                          type="date"
                          required
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">Upload Teller / Bank Receipt (Optional)</label>
                        <div className="relative flex items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className="w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-green/10 file:text-brand-green hover:file:bg-brand-green/20 cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>

                    {proofImage && (
                      <div className="p-2 bg-slate-100 rounded border border-slate-200 flex items-center space-x-3">
                        <img src={proofImage} alt="Uploaded Proof" className="w-12 h-12 object-cover rounded border" />
                        <span className="text-xs text-green-700 font-bold flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> Receipt image attached
                        </span>
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">Additional Narration / Remarks</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 1st Term 2026/2027 tuition payment for Chinedu Okafor"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
                    <p className="text-[11px] text-slate-500">
                      Paid into: <strong>UBA 1027146728 (Holy Ghost Academy)</strong>
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Payment & Generate Receipt</span>
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>
        )}

        {/* 5. TAB CONTENT 2: APPROVED FEES SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black font-heading text-brand-oxblood uppercase tracking-tight">
                    Approved Diocesan Fees & Dues Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official schedule for the 2026/2027 Academic Session. All fees are remitted into <strong>UBA 1027146728 (Holy Ghost Academy)</strong>.
                  </p>
                </div>
                
                {/* Category selector pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'jss', label: 'Junior Secondary (JSS 1-3)' },
                    { id: 'ss', label: 'Senior Secondary (SS 1-3)' },
                    { id: 'admission', label: 'New Admissions' },
                    { id: 'projects', label: 'School Projects' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFeeCategory(cat.id as any)}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition cursor-pointer ${
                        feeCategory === cat.id
                          ? 'bg-brand-oxblood text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* JSS Table */}
              {feeCategory === 'jss' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-heading uppercase text-[10px]">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Termly Amount (₦)</th>
                        <th className="py-2.5 px-3">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">Junior Secondary Tuition & Academic Instructional Fee</td>
                        <td className="py-3 px-3 font-mono font-bold text-brand-oxblood">₦35,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">ICT, Computer Laboratory & Internet Access</td>
                        <td className="py-3 px-3 font-mono">₦5,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">PTA Development Levy & Medical Retainership</td>
                        <td className="py-3 px-3 font-mono">₦5,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr className="bg-brand-green/5 font-bold text-brand-green">
                        <td className="py-3 px-3 uppercase">Total Termly School Fees (JSS 1 - JSS 3)</td>
                        <td className="py-3 px-3 font-mono text-sm font-black">₦45,000</td>
                        <td className="py-3 px-3 uppercase text-[10px]">Total Per Term</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* SS Table */}
              {feeCategory === 'ss' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-heading uppercase text-[10px]">
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Termly Amount (₦)</th>
                        <th className="py-2.5 px-3">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">Senior Secondary Tuition & Teaching Fee</td>
                        <td className="py-3 px-3 font-mono font-bold text-brand-oxblood">₦35,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">Physics, Chemistry, Biology Practical & ICT Labs</td>
                        <td className="py-3 px-3 font-mono">₦10,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">PTA Development Levy & Medical Retainership</td>
                        <td className="py-3 px-3 font-mono">₦5,000</td>
                        <td className="py-3 px-3 text-slate-500">Per Term</td>
                      </tr>
                      <tr className="bg-brand-green/5 font-bold text-brand-green">
                        <td className="py-3 px-3 uppercase">Total Termly School Fees (SS 1 - SS 3)</td>
                        <td className="py-3 px-3 font-mono text-sm font-black">₦50,000</td>
                        <td className="py-3 px-3 uppercase text-[10px]">Total Per Term</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Admission Table */}
              {feeCategory === 'admission' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-heading uppercase text-[10px]">
                        <th className="py-2.5 px-3">Admission Requirement</th>
                        <th className="py-2.5 px-3">Cost (₦)</th>
                        <th className="py-2.5 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">Entrance Examination & Application Form</td>
                        <td className="py-3 px-3 font-mono font-bold">₦10,000</td>
                        <td className="py-3 px-3 text-slate-500">One-time payment upon form collection</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">Acceptance & Orientation Package</td>
                        <td className="py-3 px-3 font-mono font-bold">₦25,000</td>
                        <td className="py-3 px-3 text-slate-500">Payable upon offer of provisional admission</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-slate-800">School Uniforms (2 Sets + Sportswear + Blazer)</td>
                        <td className="py-3 px-3 font-mono font-bold">₦30,000</td>
                        <td className="py-3 px-3 text-slate-500">Custom tailored diocesan standard uniform</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Projects Table */}
              {feeCategory === 'projects' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Alumni, philanthropists, and friends of the academy can contribute to ongoing development projects directly via <strong>UBA 1027146728</strong> with the project name as transaction narration:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-xs text-brand-green uppercase">Chemistry Lab Upgrade</h4>
                      <p className="text-[11px] text-slate-500">Target Budget: ₦8,500,000 (85% completed)</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('pay');
                          setPurpose('Diocesan Project Donation');
                          setRemarks('Donation towards Chemistry Lab Upgrade');
                        }}
                        className="text-[10px] font-bold text-brand-green hover:underline flex items-center"
                      >
                        Donate to this project &rarr;
                      </button>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-xs text-brand-green uppercase">ICT Centre Expansion</h4>
                      <p className="text-[11px] text-slate-500">Target Budget: ₦20,000,000 (45% completed)</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('pay');
                          setPurpose('Diocesan Project Donation');
                          setRemarks('Donation towards ICT Centre Expansion');
                        }}
                        className="text-[10px] font-bold text-brand-green hover:underline flex items-center"
                      >
                        Donate to this project &rarr;
                      </button>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-xs text-brand-green uppercase">Physics/Biology Overhaul</h4>
                      <p className="text-[11px] text-slate-500">Target Budget: ₦12,500,000 (60% completed)</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('pay');
                          setPurpose('Diocesan Project Donation');
                          setRemarks('Donation towards Physics & Biology Labs');
                        }}
                        className="text-[10px] font-bold text-brand-green hover:underline flex items-center"
                      >
                        Donate to this project &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* 6. TAB CONTENT 3: STATUS TRACKER & RECENT PAYMENTS */}
        {activeTab === 'status' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black font-heading text-gray-900 uppercase tracking-tight">
                    Submitted Payments & Reconciliation Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search payments by student name, reference number, or transaction teller to check bursary confirmation.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search reference or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                  />
                </div>
              </div>

              {filteredPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">No matching payment records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-heading uppercase text-[10px]">
                        <th className="py-2.5 px-3">Ref ID</th>
                        <th className="py-2.5 px-3">Student / Class</th>
                        <th className="py-2.5 px-3">Payer & Phone</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Amount (₦)</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {p.referenceNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{p.studentName}</span>
                            <span className="text-[10px] text-slate-500">{p.classLevel} {p.studentId ? `• ${p.studentId}` : ''}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 block">{p.payerName}</span>
                            <span className="text-[10px] text-slate-500">{p.payerPhone}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {p.purpose}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-brand-green">
                            ₦{Number(p.amount).toLocaleString('en-NG')}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                              p.status === 'Verified'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : p.status === 'Pending Verification'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500 font-mono text-[10.5px]">
                            {p.paymentDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
