import React from 'react'

const Footer = () => {
  return (
    <div className="bg-[#B22222] text-white py-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Erimuga. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer
