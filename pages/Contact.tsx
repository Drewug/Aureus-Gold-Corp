import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { PublicFormRenderer } from '../components/PublicFormRenderer';
import { api } from '../lib/api';
import { FormDefinition } from '../types';
import { Card } from '../components/ui';
import { Mail, MapPin, Phone } from 'lucide-react';

export const Contact = () => {
    const [form, setForm] = useState<FormDefinition | null>(null);

    useEffect(() => {
        // Load the default contact form
        api.forms.get('frm_contact').then(f => {
            if (f) setForm(f);
        });
    }, []);

    return (
        <Layout>
            <div className="bg-charcoal min-h-screen py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-serif text-white mb-4 text-center">Contact Aureus Gold Corp</h1>
                    <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                        Our dedicated team of precious metals specialists is available to assist you with acquisitions, storage inquiries, and account management.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <Card className="p-8">
                                <h3 className="text-xl font-serif text-white mb-6">Global Headquarters</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-6 h-6 text-gold mt-1" />
                                        <div>
                                            <p className="text-white font-medium">Zurich Office</p>
                                            <p className="text-gray-400 text-sm">Bahnhofstrasse 45<br/>8001 Zurich, Switzerland</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Phone className="w-6 h-6 text-gold mt-1" />
                                        <div>
                                            <p className="text-white font-medium">Secure Line</p>
                                            <p className="text-gray-400 text-sm">+41 44 215 99 99</p>
                                            <p className="text-gray-500 text-xs mt-1">Mon-Fri 08:00 - 18:00 CET</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Mail className="w-6 h-6 text-gold mt-1" />
                                        <div>
                                            <p className="text-white font-medium">Email</p>
                                            <p className="text-gray-400 text-sm">concierge@aureus.demo</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            
                            <div className="bg-charcoal-light p-6 rounded-lg border border-charcoal-lighter text-sm text-gray-400">
                                <p>
                                    <strong>Vault Access:</strong> Physical audits of allocated storage require 48-hour advance notice and security clearance. Please contact your account manager directly.
                                </p>
                            </div>
                        </div>

                        {/* Dynamic Form */}
                        <div>
                            {form ? (
                                <Card className="p-8 border-gold/20">
                                    <PublicFormRenderer form={form} />
                                </Card>
                            ) : (
                                <div className="p-12 text-center text-gray-500">Loading form...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};