import { Book } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full">
            <Book className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl text-blue-900">Grace Community Bible Study</h1>
            <p className="text-gray-600">Growing Together in Faith</p>
          </div>
        </div>
      </div>
    </header>
  );
}
