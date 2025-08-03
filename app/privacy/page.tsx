"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "../components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Map
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Data Collection and Storage
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Personal World Map is a client-side application that stores all
              data locally in your browser. We do not collect, transmit, or
              store any personal information on external servers.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Local Storage
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Your travel data, including country statuses, notes, and visit
              dates, is stored locally in your browser&apos;s localStorage. This
              data:
            </p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Remains on your device only</li>
              <li>Is not transmitted to any external servers</li>
              <li>Can be cleared by clearing your browser data</li>
              <li>Is not accessible to other websites</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Third-Party Services
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We use the following third-party services:
            </p>
            <ul className="list-disc ml-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>
                <strong>World Atlas CDN:</strong> For loading geographic map
                data (countries-110m.json)
              </li>
              <li>
                <strong>Vercel (if hosted):</strong> For website hosting and
                delivery
              </li>
            </ul>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Analytics and Tracking
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              We do not use any analytics, tracking, or monitoring services. No
              user behavior data is collected.
            </p>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Data Security
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Since all data is stored locally in your browser, the security of
              your data depends on your device&apos;s security measures. We
              recommend keeping your browser and device updated.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
