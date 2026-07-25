import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/LegalPage';

// NOTE FOR THE OPERATOR: the bracketed [PLACEHOLDERS] must be filled with your
// real legal details before launch, and the whole document should be reviewed
// by a lawyer. It is written to align with India's Digital Personal Data
// Protection Act, 2023, but it is a starting point, not legal advice.
const Privacy = () => (
  <LegalPage eyebrow="Legal" title="Privacy Policy" updated="[DATE]">
    <p>
      This Privacy Policy explains how [COMPANY LEGAL NAME] (“Erimuga”, “we”, “us”) collects, uses,
      shares and protects your personal data when you use erindmuga.com and related services. We
      process personal data in accordance with India's Digital Personal Data Protection Act, 2023
      (“DPDP Act”). For the purposes of that Act, we are the Data Fiduciary and you are the Data
      Principal.
    </p>

    <Section heading="What we collect">
      <ul className="list-disc space-y-1.5 pl-5">
        <li><strong>Account data</strong> — your name, email address and phone number.</li>
        <li><strong>Order data</strong> — delivery addresses, items purchased, and order history.</li>
        <li><strong>Payment data</strong> — processed by our payment partner (Razorpay). We do not
          store your card, UPI or bank details on our servers.</li>
        <li><strong>Technical data</strong> — a single essential session cookie that keeps you signed
          in and remembers your cart. We do not use advertising or tracking cookies.</li>
      </ul>
    </Section>

    <Section heading="Why we use it, and our lawful basis">
      <p>
        We use your data to create and manage your account, fulfil and deliver your orders, provide
        customer support, and meet legal obligations such as tax and accounting requirements. Our
        lawful bases are your <strong>consent</strong>, the <strong>performance of our contract</strong>
        with you (processing your orders), and <strong>compliance with law</strong>.
      </p>
    </Section>

    <Section heading="Cookies and consent">
      <p>
        We ask for your consent to our use of cookies and data when you first visit. You can withdraw
        or change that consent at any time by clearing it in your browser; the notice will then
        reappear. Because our only cookie is strictly necessary for the site to function, disabling it
        will prevent sign-in and cart features from working.
      </p>
    </Section>

    <Section heading="Who we share it with">
      <p>We share the minimum data needed with trusted processors:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li><strong>Razorpay</strong> — to process payments.</li>
        <li><strong>Cloudinary</strong> — to host product and site images (no customer data).</li>
        <li><strong>Delivery partners</strong> — to ship your orders.</li>
      </ul>
      <p>We do not sell your personal data.</p>
    </Section>

    <Section heading="How long we keep it">
      <p>
        We keep your account data until you delete your account. Order and invoice records are
        retained for the period required by Indian tax and accounting law even after account deletion,
        with personal identifiers removed where possible.
      </p>
    </Section>

    <Section heading="Your rights">
      <p>Under the DPDP Act you have the right to:</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li><strong>Access</strong> — download a copy of the data we hold about you.</li>
        <li><strong>Correction</strong> — fix inaccurate or incomplete data.</li>
        <li><strong>Erasure</strong> — delete your account and personal data.</li>
        <li><strong>Withdraw consent</strong> — as easily as you gave it.</li>
        <li><strong>Grievance redressal</strong> — raise a complaint with us, and escalate to the
          Data Protection Board of India if unresolved.</li>
      </ul>
      <p>
        You can exercise access, correction and erasure directly from your{' '}
        <Link to="/dashboard" className="text-brand underline underline-offset-2">account dashboard</Link>,
        or by contacting our Grievance Officer below.
      </p>
    </Section>

    <Section heading="Security">
      <p>
        We use industry-standard measures including encrypted connections (HTTPS), hashed passwords
        and access controls. No method of transmission or storage is completely secure, but we work to
        protect your data and to notify you and the authorities of any breach as required by law.
      </p>
    </Section>

    <Section heading="Children">
      <p>
        Our services are not directed at children under 18. Where required by the DPDP Act, we obtain
        verifiable parental consent before processing a child's personal data.
      </p>
    </Section>

    <Section heading="Grievance Officer">
      <p>
        In line with the DPDP Act and the Information Technology Act, you can contact our Grievance
        Officer for any privacy question or complaint:
      </p>
      <p>
        [GRIEVANCE OFFICER NAME]<br />
        [COMPANY LEGAL NAME]<br />
        [REGISTERED ADDRESS]<br />
        Email: <a href="mailto:[GRIEVANCE EMAIL]" className="text-brand underline underline-offset-2">[GRIEVANCE EMAIL]</a><br />
        Phone: [PHONE]
      </p>
      <p>We will acknowledge and address grievances within the timelines required by law.</p>
    </Section>

    <Section heading="Changes to this policy">
      <p>
        We may update this policy from time to time. When we make material changes we will update the
        date above and, where appropriate, ask for your consent again.
      </p>
    </Section>
  </LegalPage>
);

export default Privacy;
