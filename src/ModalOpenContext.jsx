import React, { createContext, useContext, useState } from 'react';

const ModalOpenContext = createContext({ modalOpen: false, setModalOpen: () => {} });

export function ModalOpenProvider({ children }) {
    const [modalOpen, setModalOpen] = useState(false);
    return (
        <ModalOpenContext.Provider value={{ modalOpen, setModalOpen }}>
            {children}
        </ModalOpenContext.Provider>
    );
}

export function useModalOpen() {
    return useContext(ModalOpenContext);
}

