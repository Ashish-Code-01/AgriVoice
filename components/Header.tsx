import React from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { LogIn } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header style={{ padding: '1rem', backgroundColor: '#b5e37188', borderBottom: '1px solid #ccc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>AgriVoice Assistant</h1>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <a href="/sign-in" style={{ textDecoration: 'none', color: 'rgb(32, 137, 75)' ,display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <LogIn />
                        {/* <span>Login</span> */}
                    </a>
                </SignedOut>
            </div>
        </header>
    );
};

export default Header;