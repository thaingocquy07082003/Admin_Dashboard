'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

//   const handleBackClick = () => {
//     router.push('/dashboard');
//   };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to delete the account
    alert(`Account with email ${email} will be deleted in 3 days`);
    setEmail(''); // Reset input
  };

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="max-w-[600px] mx-auto bg-card p-8 rounded-lg shadow-lg">
        {/* <button
          onClick={handleBackClick}
          className="mb-8 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Quay lại
        </button> */}

        <h1 className="text-3xl font-bold text-[#d9534f] text-center mb-8">Delete Account</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-input bg-background text-foreground"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
}
