import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: August 2026 | DTS App (com.dtssolutions.app)
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to the <strong>DTS App</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our localized e-commerce platform connecting customers, retailers, and wholesalers across India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-2">Depending on your user role (Customer, Retailer, or Wholesaler), we may collect the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account & Profile Details:</strong> Name, email address, phone number, and password.</li>
              <li><strong>Business Details (For Vendors):</strong> Wholesaler and retailer business names, complete business addresses, license details, and contact numbers.</li>
              <li><strong>Location Data:</strong> Your geographic location to help you discover local wholesalers, retailers, and products within your proximity.</li>
              <li><strong>Transaction & Preference Data:</strong> Order details, product preferences, and Cash on Delivery (COD) choices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and secure multi-role login systems for customers, retailers, and wholesalers.</li>
              <li>Facilitate local product discovery, pricing comparisons, and vendor connections.</li>
              <li>Process orders, manage Cash on Delivery (COD) workflows, and connect buyers directly to nearby local shops.</li>
              <li>Send important platform updates, customer support communications, and verification notifications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal or business data. Information is shared only as necessary to fulfill platform operations—such as displaying vendor business profiles and addresses to customers for local shopping or direct store visits. We may also disclose information if required by Indian law enforcement or regulatory authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security protocols, encryption, and secure cloud databases (such as Supabase) to protect your personal and business records from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your account information at any time through your profile settings or by reaching out to our support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or the DTS App, please contact us at:
            </p>
            <p className="mt-2 font-medium text-gray-900">
              Email: support@dtssolutions.app <br />
              Location: India
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}