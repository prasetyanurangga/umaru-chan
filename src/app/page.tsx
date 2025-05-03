// app/page.tsx (halaman login di path '/')
import { Button } from '@/components/ui/button';
import { getBaseUrl } from '@/app/lib/getBaseUrl';

export default function LoginPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const clientId = process.env.MONDAY_CLIENT_ID!; 
  const redirectUriRaw = getBaseUrl();
  const redirectUri = encodeURIComponent(`${redirectUriRaw}`);

  const loginUrl = `https://auth.monday.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;

  return (
    <div className="app-containe h-screen w-screen flex justify-center items-center">
      <a href={loginUrl}>
        <Button>Login with Monday</Button>
      </a>
    </div>
  );
}
