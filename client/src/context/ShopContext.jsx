

export const ShopContext = React.createContext()

const ShopContextProvider = (props) => {

    const value = {}

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider