import { ChevronDownIcon } from '@heroicons/react/24/solid';

const Contact = () => {
  return (
    <div className="isolate bg-[#fffaf5] px-6 sm:py-32 lg:px-8">
      <div className="container mx-auto max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-[#b22222]/10">
        
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#b22222] sm:text-5xl">
            Contact Us
          </h2>
          <p className="mt-2 text-lg text-gray-700">
            We’ll get back to you as soon as possible. Thank you for reaching out.
          </p>
        </div>

        {/* Form */}
        <form action="#" method="POST" className="mx-auto mt-8">
          
          {/* Name */}
          <div className="sm:col-span-2">
            <label htmlFor="full-name" className="block text-sm font-semibold text-gray-900">
              Name <span className="text-[#b22222]">*</span>
            </label>
            <div className="mt-1.5 mb-4">
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="given-name"
                placeholder="Your name"
                required
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-700 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
              />
            </div>
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
              Email <span className="text-[#b22222]">*</span>
            </label>
            <div className="mt-1.5 mb-4">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-700 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="sm:col-span-2">
            <label htmlFor="phone-number" className="block text-sm font-semibold text-gray-900">
              Phone number <span className="text-[#b22222]">*</span>
            </label>
            <div className="mt-1.5 mb-4">
              <div className="flex rounded-md bg-white border border-gray-300 focus-within:border-[#b22222] focus-within:ring-2 focus-within:ring-[#b22222]/40">
                <div className="grid shrink-0 grid-cols-1 relative">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country"
                    aria-label="Country"
                    required
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md py-2 pr-7 pl-3.5 text-base text-gray-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option>IN</option>
                    <option>US</option>
                    <option>CA</option>
                    <option>EU</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500"
                  />
                </div>
                <input
                  id="phone-number"
                  name="phone-number"
                  type="text"
                  placeholder="9876543210"
                  required
                  className="block min-w-0 grow py-2 pr-3 pl-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-semibold text-gray-900">
              Message <span className="text-[#b22222]">*</span>
            </label>
            <div className="mt-2.5 mb-4">
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Write your message..."
                required
                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-500 focus:border-[#b22222] focus:ring-2 focus:ring-[#b22222]/40"
              />
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="flex items-center gap-x-3 sm:col-span-2">
            <input
              id="agree-to-policies"
              name="agree-to-policies"
              type="checkbox"
              required
              className="h-4 w-4 rounded border-gray-300 text-[#b22222] focus:ring-[#b22222]"
            />
            <label htmlFor="agree-to-policies" className="text-sm text-gray-600">
              By selecting this, you agree to our{' '}
              <a href="#" className="font-semibold text-[#b22222] hover:text-[#8b1717]">
                privacy policy
              </a>
              .
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="block w-full rounded-md bg-[#b22222] px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-md hover:bg-[#8b1717] transition-colors"
            >
              Let's Talk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
