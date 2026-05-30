import { useEffect, useState } from 'react';
import ContactCards from '../components/contact/ContactCards.jsx';
import ContactForm from '../components/contact/ContactForm.jsx';
import ContactHero from '../components/contact/ContactHero.jsx';
import { getContactChannels } from '../services/sheetsApi.js';

export default function Contact() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    getContactChannels().then(setChannels);
  }, []);

  return (
    <div className="page contact-page">
      <ContactHero />
      <ContactCards channels={channels} />
      <ContactForm />
    </div>
  );
}
