import React from 'react';

function UserManual() {
    return (
        <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">📖사용자 매뉴얼</h2>
            <a href="/Duo_User_Manual.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">(PDF)</a>
        </div>
    );
}

export default UserManual;
