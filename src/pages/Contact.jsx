import { useEffect, useState } from 'react';
import ContactCards from '../components/contact/ContactCards.jsx';
import ContactForm from '../components/contact/ContactForm.jsx';
import ContactHero from '../components/contact/ContactHero.jsx';
import { getContactChannels } from '../services/sheetsApi.js';
import { getStoredContact } from '../services/catalogStorage.js';

export default function Contact() {
  const [channels, setChannels] = useState(getStoredContact);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getContactChannels()
      .then((data) => {
        setChannels(data);
      })
      .finally(() => {
        setLoading(false);
      });

    const handleUpdate = () => {
      getContactChannels().then(setChannels);
    };
    window.addEventListener('evolumind_contact_updated', handleUpdate);
    return () => window.removeEventListener('evolumind_contact_updated', handleUpdate);
  }, []);

  return (
    <div className="page contact-page">
      <ContactHero />
      <ContactCards channels={channels} loading={loading} />
      <ContactForm />
    </div>
  );
}
