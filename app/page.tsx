import { redirect } from 'next/navigation';

// Next.js App Router 默认不 serve public/index.html，重定向一下
export default function Page() {
  redirect('/index.html');
}
