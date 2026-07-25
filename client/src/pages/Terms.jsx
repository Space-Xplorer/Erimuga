import React from 'react';
import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/LegalPage';

// NOTE FOR THE OPERATOR: fill the [PLACEHOLDERS] and have this reviewed by a
// lawyer before launch. It is a reasonable starting point, not legal advice.
const Terms = () => (
  <LegalPage eyebrow="Legal" title="Terms of Service" updated="[DATE]">
    <p>
      These Terms govern your use of erindmuga.com, operated by [COMPANY LEGAL NAME] (“Erimuga”). By
      using the site or placing an order, you agree to these Terms.
    </p>

    <Section heading="Orders and pricing">
      <p>
        All prices are listed in Indian Rupees (₹) and include applicable taxes unless stated
        otherwise. We make every effort to display accurate prices and product information, but errors
        may occur; where a genuine error is found we may cancel the affected order and refund you.
      </p>
    </Section>

    <Section heading="Payments">
      <p>
        Payments are processed securely by Razorpay. We accept the methods shown at checkout,
        including Cash on Delivery where available. We do not store your payment credentials.
      </p>
    </Section>

    <Section heading="Shipping and delivery">
      <p>
        We ship to serviceable addresses within [SHIPPING REGION]. Estimated delivery times are shown
        at checkout and are indicative, not guaranteed. Risk in the goods passes to you on delivery.
      </p>
    </Section>

    <Section heading="Cancellations, returns and refunds">
      <p>
        You may cancel an order before it is dispatched from your account. For returns and refunds,
        please see our [RETURN POLICY] or contact us within [RETURN WINDOW] of delivery. Handwoven
        products may show natural variation in colour and weave, which is not a defect.
      </p>
    </Section>

    <Section heading="Your account">
      <p>
        You are responsible for keeping your login details secure. You can manage your data and delete
        your account from your{' '}
        <Link to="/dashboard" className="text-brand underline underline-offset-2">dashboard</Link>. Our
        handling of your personal data is described in our{' '}
        <Link to="/privacy" className="text-brand underline underline-offset-2">Privacy Policy</Link>.
      </p>
    </Section>

    <Section heading="Intellectual property">
      <p>
        All content on this site — images, text and designs — belongs to Erimuga or its licensors and
        may not be reused without permission.
      </p>
    </Section>

    <Section heading="Limitation of liability">
      <p>
        To the extent permitted by law, our liability for any order is limited to the amount you paid
        for that order. Nothing in these Terms limits liability that cannot be limited under Indian
        law.
      </p>
    </Section>

    <Section heading="Governing law">
      <p>
        These Terms are governed by the laws of India, and disputes are subject to the courts of
        [CITY], [STATE].
      </p>
    </Section>

    <Section heading="Contact">
      <p>
        Questions about these Terms? Email{' '}
        <a href="mailto:[SUPPORT EMAIL]" className="text-brand underline underline-offset-2">[SUPPORT EMAIL]</a>{' '}
        or use our <Link to="/contact" className="text-brand underline underline-offset-2">contact page</Link>.
      </p>
    </Section>
  </LegalPage>
);

export default Terms;
