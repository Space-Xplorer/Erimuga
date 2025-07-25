import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#B22222] text-white py-4 w-full mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Erimuga. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
