"use client";

import React from 'react';

const TermsAndConditions = () => {
  const lastUpdated = "January 13, 2026";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-20 px-6 relative border-b border-yellow-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full mb-6 border border-yellow-200">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-700">
              Legal Agreement
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase mb-6">
            TERMS OF <br /> <span className="text-red-600 ">SERVICE</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            Agreement to our legal terms and operational protocols
          </p>
          <p className="text-gray-400 text-xs mt-4">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        
        {/* AGREEMENT INTRO */}
        <section className="mb-16 bg-gray-50 p-8 rounded-3xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight uppercase">Agreement to our Legal Terms</h2>
          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <p>
              We are <strong>QICKTICK</strong>, doing business as <strong>QT</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;), a company registered in India at Vidyanagar, KABBUR, Haveri, Karnataka 581110.
            </p>
            <p>
              We operate the website <a href="http://www.qicktick.com" className="text-red-600 underline font-bold">http://www.qicktick.com</a> (the &quot;Site&quot;), the mobile application QICKTICK (the &quot;App&quot;), as well as any other related products and services that refer or link to these legal terms (the &quot;Legal Terms&quot;) (collectively, the &quot;Services&quot;).
            </p>
            <p className=" bg-white p-4 rounded-lg border border-gray-200">
              This is commonly based on a subscription-based company for giving leads or customers to the register shop vendors and business owners. We have also included transportation benefits for customers and all; also, it&apos;s mainly helpful to B2B and B2C sectors. We will give big business to those categories. We will promote business categories and give the business from our side. This is brief information about our company.
            </p>
            <p>
              You can contact us by phone at <strong>7892999063</strong>, email at <strong>qicktick2025@gmail.com</strong>, or by mail to Vidyanagar, kabbur, Haveri, Karnataka 581110, India.
            </p>
            <p className="font-black text-gray-900 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
            <p>The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.</p>
          </div>
        </section>

        {/* FULL LEGAL SECTIONS */}
        <div className="space-y-12 text-sm leading-relaxed text-gray-600">
          
          {/* 1. OUR SERVICES */}
          <section id="s1">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">1. Our Services</h3>
            <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.</p>
          </section>

          {/* 2. INTELLECTUAL PROPERTY */}
          <section id="s2">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">2. Intellectual Property Rights</h3>
            <div className="space-y-4">
              <p><strong>Our intellectual property:</strong> We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics (collectively, the &quot;Content&quot;), as well as the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;).</p>
              <p><strong>Your use of our Services:</strong> Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.</p>
              <p><strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services (&quot;Submissions&quot;), you agree to assign to us all intellectual property rights in such Submission. We shall own this Submission and be entitled to its unrestricted use.</p>
            </div>
          </section>

          {/* 3. USER REPRESENTATIONS */}
          <section id="s3">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">3. User Representations</h3>
            <p>By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information; (3) you have the legal capacity; (4) you are not a minor; (5) you will not access the Services through automated or non-human means; (6) you will not use the Services for any illegal purpose; and (7) your use will not violate any applicable law or regulation.</p>
          </section>

          {/* 6 & 7. PURCHASES & SUBSCRIPTIONS */}
          <section id="s6" className="bg-gray-900 text-white p-8 rounded-3xl">
            <h3 className="text-xl font-black mb-6 uppercase text-yellow-400 ">6. Purchases, Payments & Subscriptions</h3>
            <div className="space-y-6">
              <div>
                <p className="text-gray-300 mb-2 font-bold">Accepted Payment Methods:</p>
                <div className="flex flex-wrap gap-2">
                  {['Online Payments', 'Cheque', 'PhonePe', 'Paytm', 'Net Banking', 'Mobile Banking'].map(m => (
                    <span key={m} className="bg-gray-800 text-[10px] px-3 py-1 rounded-full border border-gray-700 uppercase font-black">{m}</span>
                  ))}
                </div>
              </div>
              <p className="text-sm"><strong>7. Subscriptions:</strong> Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge. We offer a <strong>7-day free trial</strong> to new users.</p>
              <p className="text-sm text-red-400 font-bold uppercase tracking-widest">8. Refunds Policy: We do not refund our subscription fees for any reason.</p>
            </div>
          </section>

          {/* 9. PROHIBITED ACTIVITIES */}
          <section id="s9">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">9. Prohibited Activities</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-none text-xs text-gray-500 font-medium">
              <li>• Systematically retrieving data to compile databases</li>
              <li>• Trick, defraud, or mislead us and other users</li>
              <li>• Circumventing security-related features</li>
              <li>• Disparage, tarnish, or harm our reputation</li>
              <li>• Uploading viruses or malicious code</li>
              <li>• Attempting to impersonate another user</li>
              <li>• Harassing or threatening our employees</li>
              <li>• Using buying agents to make purchases</li>
            </ul>
          </section>

          {/* 14. SOCIAL MEDIA */}
          <section id="s14">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">14. Social Media</h3>
            <p>As part of the functionality of the Services, you may link your account with Third-Party Account providers. You represent and warrant that you are entitled to disclose your Third-Party Account login information to us. PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS.</p>
          </section>

          {/* 15. THIRD-PARTY WEBSITES */}
          <section id="s15">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">15. Third-Party Websites and Content</h3>
            <p>The Services may contain links to other websites (&quot;Third-Party Websites&quot;). Such Third-Party Websites are not investigated, monitored, or checked for accuracy by us. If you decide to leave the Services and access the Third-Party Websites, you do so at your own risk. Any purchases you make through Third-Party Websites are exclusively between you and the applicable third party.</p>
          </section>

          {/* 18 & 19. TERMINATION & MODIFICATIONS */}
          <section id="s18">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">18. Term and Termination</h3>
            <p>WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES TO ANY PERSON FOR ANY REASON. We may terminate your use or participation in the Services or delete your account at any time, without warning.</p>
            <h3 className="text-lg font-black text-gray-900 mt-8 mb-4 uppercase  tracking-tighter">19. Modifications and Interruptions</h3>
            <p>We reserve the right to change, modify, or remove the contents of the Services at any time. We cannot guarantee the Services will be available at all times. You agree that we have no liability whatsoever for any loss caused by your inability to access the Services during downtime.</p>
          </section>

          {/* 20 & 21. LAW & DISPUTE RESOLUTION */}
          <section id="s20">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">20. Governing Law</h3>
            <p>These Legal Terms shall be governed by and defined following the laws of <strong>India</strong>. QICKTICK and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction.</p>
            <h3 className="text-lg font-black text-gray-900 mt-8 mb-4 uppercase  tracking-tighter">21. Dispute Resolution</h3>
            <p><strong>Informal Negotiations:</strong> To expedite resolution, the Parties agree to first attempt to negotiate any Dispute informally for at least seven (7) days before initiating arbitration. <strong>Binding Arbitration:</strong> Any dispute shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels) with the seat of arbitration in India.</p>
          </section>

          {/* 23 & 24. DISCLAIMER & LIABILITY */}
          <section id="s23" className="border-2 border-red-600 p-8 rounded-3xl">
            <h3 className="text-red-600 font-black mb-4 uppercase  tracking-tighter">23. Disclaimer</h3>
            <p className="text-[10px] font-black leading-relaxed uppercase mb-6">
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE ASSUME NO LIABILITY FOR PERSONAL INJURY OR PROPERTY DAMAGE RESULTING FROM YOUR ACCESS TO OUR SERVICES.
            </p>
            <h3 className="text-gray-900 font-black mb-4 uppercase  tracking-tighter">24. Limitations of Liability</h3>
            <p className="text-[10px] font-black leading-relaxed uppercase">
              IN NO EVENT WILL WE OR OUR DIRECTORS BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES. OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY YOU TO US DURING THE MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION ARISING.
            </p>
          </section>

          {/* 27. ELECTRONIC COMMUNICATIONS */}
          <section id="s27">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">27. Electronic Communications</h3>
            <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, and disclosures satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, AND ORDERS.</p>
          </section>

          {/* 29. MISCELLANEOUS */}
          <section id="s29">
            <h3 className="text-lg font-black text-gray-900 mb-4 uppercase  tracking-tighter">29. Miscellaneous</h3>
            <p>These Legal Terms constitute the entire agreement between you and us. Our failure to exercise or enforce any right shall not operate as a waiver. If any provision is determined to be unlawful, that provision is deemed severable and does not affect the validity of remaining provisions.</p>
          </section>

          {/* 30. CONTACT */}
          <section id="s30" className="pt-12 border-t border-gray-100">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase  tracking-tighter">30. Contact Us</h3>
                <p className="text-gray-600 mb-8 font-medium">In order to resolve a complaint regarding the Services or to receive further information, please contact us at:</p>
                <div className="bg-white border-2 border-black p-8 rounded-2xl shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]">
                  <div className="space-y-1 font-bold text-gray-900 uppercase tracking-tight">
                    <p className="text-red-600 text-xl font-black  mb-2 tracking-tighter">QICKTICK (QT)</p>
                    <p>Vidyanagar, kabbur</p>
                    <p>Haveri, Karnataka 581110, India</p>
                    <div className="pt-4 space-y-1">
                      <p>Phone: <span className="text-red-600">7892999063</span></p>
                      <p>Email: <span className="text-red-600 underline">qicktick2025@gmail.com</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-[#FEF3C7] p-8 rounded-3xl border border-yellow-200">
                <p className="text-[10px] font-black uppercase text-yellow-700 tracking-widest mb-2">Legal Compliance</p>
                <p className="text-sm font-bold text-gray-800 leading-tight ">
                  &quot;We give big business to our categories. We promote business and give the business from our side.&quot;
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* --- STICKY PRINT BUTTON --- */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => window.print()}
          className="bg-black text-white p-4 rounded-full shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 group"
          title="Print Terms"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;