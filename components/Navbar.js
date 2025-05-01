// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-700 text-green-400 px-6 flex items-center justify-between">
      <div>
      <header className="bg-slate-700 text-white p-2">
        <h1 className="text-2xl font-bold text-center text-green-300">Ktex Material Flow Management System</h1>
      </header>
      </div>
      <div>
      <ul className="flex space-x-4 justify-center">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/jumbo-entry" className="hover:underline">
            Jumbo Entry
          </Link>
        </li>
        <li>
          <Link href="/raw-material" className="hover:underline">
            Raw Material
          </Link>
        </li>
        <li>
          <Link href="/finish-goods" className="hover:underline">
            Finish Goods
          </Link>
        </li>
        <li>
          <Link href="/reports" className="hover:underline">
            Reports
          </Link>
        </li>
      </ul>
      </div>
    </nav>
  );
}
