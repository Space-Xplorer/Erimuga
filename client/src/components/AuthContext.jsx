import React from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // Perform login logic here
    setUser({ email })
  }

  const logout = () => {
    // Perform logout logic here
    setUser(null)
  }
    const isLoggedIn = !!user
  return (
    <div>
      
    </div>
  )
}

export default AuthContext
