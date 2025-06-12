'use client';
import { useRouter } from 'next/navigation';

export default function PolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-5">
      <div className="max-w-[800px] mx-auto bg-card p-8 rounded-lg shadow-lg">

        <h1 className="text-3xl font-bold text-[#d9534f] text-center mb-5">Privacy Policy for StarGazerTelling</h1>
        <p className="text-center italic text-muted-foreground mb-8"><strong>Last Updated:</strong> June 12, 2025</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Introduction</h2>
        <p className="my-4 text-foreground">Welcome to StarGazerTelling (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (&quot;App&quot;). A little bit about me (us), I am an individual programmer who is on the path of developing applications that help life and users. This application is a product that is being completed and improved over time. Let's help each other in the coming time.</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Information We Collect</h2>

        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">Information You Provide</h3>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Account Information:</strong> When you create an account, we collect your email address and password.</li>
          <li><strong>Profile Information:</strong> You may choose to provide additional information such as your name and your date of birth.</li>
          <li><strong>User Content:</strong> Information you provide when using our features, including hand photos you upload, comments, and feedback reports.</li>
          <li><strong>Communication:</strong> Information you provide when contacting us, including email communications.</li>
        </ul>

        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">Third-Party Authentication</h3>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Google Sign-In:</strong> When you choose to sign in with Google, we receive information from your Google account such as your name, email address, and profile picture. We only store and use this information to manage your account with us.</li>
        </ul>

        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">Information Collected Automatically</h3>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Device Information:</strong> We collect information about your mobile device, including device model, operating system version, unique device identifiers, and mobile network information using the <code>device_info_plus</code> plugin.</li>
          {/* <li><strong>Location Information:</strong> With your permission, we collect your precise location data to provide location-based features such as finding nearby restaurants and navigation services using the <code>geolocator</code> and <code>location</code> plugins.</li> */}
          <li><strong>Usage Data:</strong> Information about how you use our App, including features you use and time spent on the App.</li>
          <li><strong>Photos and Media:</strong> With your permission, we access your camera and photo library to allow you to take and upload photos of hand.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">How We Use Your Information</h2>
        <p className="my-4 text-foreground">We use the information we collect to:</p>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li>Provide, maintain, and improve our App and its services.</li>
          <li>Provide and improve the accuracy of our palm line recognition feature.</li>
          <li>Manage your account and facilitate your use of the App&apos;s features.</li>
          <li>Send you technical notices, updates, security alerts, and support messages.</li>
          <li>Respond to your comments, questions, and provide customer service.</li>
          <li>Develop new products and services.</li>
          <li>Generate anonymized, aggregate statistics about how users interact with our App to understand usage patterns and improve our services.</li>
          <li>Protect against, identify, and prevent fraud and other illegal activity.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Third-Party Services</h2>
        {/* <h3 className="text-xl font-semibold text-[#337ab7] mt-6">Google Maps API</h3>
        <p className="my-4 text-foreground">We use Google Maps API services in our App to provide you with location-based features:</p>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Nearby Search:</strong> We use your location data to search for restaurants and food establishments near you using Google's Places API.</li>
          <li><strong>Place Details:</strong> We retrieve detailed information about specific locations including address, opening hours, reviews, and photos from Google Places API.</li>
          <li><strong>Directions:</strong> We use Google Directions API to provide navigation routes to restaurants.</li>
        </ul>
        <p className="my-4 text-foreground">When you use these features, your location data and search queries are sent to Google. This information is subject to Google's Privacy Policy, which can be found at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://policies.google.com/privacy</a>.</p> */}

        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">OpenAI API</h3>
        <p className="my-4 text-foreground">We use OpenAI API to create a virtual assistant that can answer user questions in a certain scope and field. OpenAI&apos;s use of your data is governed by their Privacy Policy, which can be found at <a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://openai.com/policies/privacy-policy/</a>.</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Recognition History and Training Data</h2>
        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">Recognition History</h3>
        <p className="my-4 text-foreground">When you take a photo to identify palm lines in a hand, the image is stored in your personal history so you can revisit previous recognitions. You may delete any photo from your history at any time, and it will be permanently removed from our system.</p>

        <h3 className="text-xl font-semibold text-[#337ab7] mt-6">AI Training Data (Optional)</h3>
        <p className="my-4 text-foreground">With your <strong>explicit consent</strong>, photos you capture may also be stored in a separate dataset on Cloudinary to help us train and improve our palm lines recognition model. These images may be associated with your user ID internally for management and auditing purposes, but they will not be shown publicly and are used exclusively for machine learning improvement. You may contact us to request removal of training data previously shared with consent.</p>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li>You can enable or disable this feature at any time directly on the home screen using the &quot;Allow Save&quot; toggle.</li>
          <li>Training images are not shown in your history.</li>
          <li>Deleting a photo from your history does not automatically remove it from the training dataset if previously shared with consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Permissions We Request</h2>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Camera:</strong> To allow you to take photos of hand for recognition.</li>
          <li><strong>Photo Library/Media Access:</strong> To allow you to upload existing photos from your device for recognition, and for the App to potentially save images if needed (Permissions: <code>READ_EXTERNAL_STORAGE</code>, <code>WRITE_EXTERNAL_STORAGE</code> for older Android versions; <code>READ_MEDIA_IMAGES</code>, <code>READ_MEDIA_VIDEO</code> for Android 13+).</li>
          {/* <li><strong>Location:</strong> To provide location-based features such as finding nearby restaurants and restaurant recommendations (Permissions: <code>ACCESS_FINE_LOCATION</code>, <code>ACCESS_COARSE_LOCATION</code>).</li> */}
          <li><strong>Internet:</strong> To connect to our servers and provide our services (Permission: <code>INTERNET</code>).</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Data Sharing and Disclosure</h2>
        <p className="my-4 text-foreground">We may share your information with:</p>
        <ul className="list-disc pl-6 my-4 text-foreground">
          {/* <li><strong>Service Providers:</strong>
            <ul className="list-disc pl-6 my-2">
              <li><strong>Cloudinary:</strong> As described above, for storing images.</li>
              <li><strong>Google:</strong> Location data and search queries are shared with Google when you use our map and location-based features, as described in the "Google Maps API" section.</li>
              <li>We may use other third-party vendors for services such as analytics or error reporting in the future. If so, this policy will be updated to reflect those changes.</li>
            </ul>
          </li> */}
          <li><strong>Sharing Initiated by You:</strong> When you choose to share content from our App with friends or on social media platforms using your device&apos;s native sharing functionalities. In such cases, the sharing is governed by the privacy policies of those third-party platforms.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to:
            <ul className="list-disc pl-6 my-2">
              <li>Comply with a legal obligation.</li>
              <li>Protect and defend our rights or property.</li>
              <li>Prevent or investigate possible wrongdoing in connection with the App.</li>
              <li>Protect the personal safety of users of the App or the public.</li>
              <li>Protect against legal liability.</li>
            </ul>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Data Security</h2>
        <p className="my-4 text-foreground">We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Your Rights</h2>
        <p className="my-4 text-foreground">Depending on your location and applicable law, you may have certain rights regarding your personal information, including:</p>
        <ul className="list-disc pl-6 my-4 text-foreground">
          <li><strong>Access:</strong> The right to access the personal information we hold about you.</li>
          <li><strong>Correction:</strong> The right to request correction of inaccurate or incomplete personal information.</li>
          <li><strong>Deletion:</strong> The right to request deletion of your personal information, subject to certain exceptions.</li>
          <li><strong>Restriction:</strong> The right to request restriction of processing of your personal information.</li>
          <li><strong>Objection:</strong> The right to object to our processing of your personal information.</li>
          <li><strong>Data Portability:</strong> The right to request a copy of your personal information in a portable format.</li>
        </ul>
        <p className="my-4 text-foreground">To exercise any of these rights, please contact us at gmail <a href="thaingocquy2003@gmail.com" className="text-primary hover:underline">thaingocquy2003@gmail.com</a>. We will respond to your request in accordance with applicable law.</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Children&apos;s Privacy</h2>
        <p className="my-4 text-foreground">Our App is not directed to children under the age of 13 (or the applicable age in your jurisdiction), and we do not knowingly collect personal information from children under this age. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to remove that information from our servers. If you believe that we might have any information from or about a child under the relevant age, please contact us at gmail <a href="thaingocquy2003@gmail.com" className="text-primary hover:underline">thaingocquy2003@gmail.com</a>.</p>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Changes to This Privacy Policy</h2>
        <p className="my-4 text-foreground">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date at the top. For significant changes, we may also provide a more prominent notice (such as an in-app notification or an email to your registered address, if applicable). You are advised to review this Privacy Policy periodically for any changes.</p>

        <div className="mt-8 p-4 bg-muted border-l-4 border-[#5cb85c]">
          <h2 className="text-2xl font-semibold text-[#5cb85c] mb-4">Contact Us</h2>
          <p className="my-2 text-foreground">If you have any questions about this Privacy Policy, please contact us at:</p>
          <p className="my-2 text-foreground">Email: <a href="thaingocquy2003@gmail.com" className="text-primary hover:underline">thaingocquy2003@gmail.com</a></p>
        </div>

        <h2 className="text-2xl font-semibold text-[#5cb85c] border-b-2 border-border pb-2 mt-8">Consent</h2>
        <p className="my-4 text-foreground">By downloading, installing, accessing, or using our App, you consent to our Privacy Policy and agree to its terms.</p>
      </div>
    </div>
  );
}
