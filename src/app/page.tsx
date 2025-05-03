'use client';

import { Button } from '@/components/ui/button';
import React, { use, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

function Login() {

  useEffect(() => {
    const baseUrl = window.location.origin;
    Cookies.set('base_url', baseUrl, { path: '/', sameSite: 'Lax' });
  }
  , []);

  const handleLogin = () => {
    window.location.href = "api/auth/monday";
  }


  return (
    <div className="app-containe h-screen w-screen flex justify-center items-center">
      <Button onClick={handleLogin}>
        Login with Monday
      </Button>
    </div>
  );
}

export default Login;
