import React from 'react';

function UserManual() {
    return (
        <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">사용자 매뉴얼</h2>
            <p className="text-slate-500 text-sm">
                Duo 사용에 대한 자세한 내용은 사용자 매뉴얼을 참조하십시오.
            </p>
            <a href="/Duo_User_Manual.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                사용자 매뉴얼 (PDF)
            </a>
        </div>
    );
}

export default UserManual;
