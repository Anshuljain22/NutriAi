import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
    title: "Contact | NutriAI",
    description: "Get in touch with the NutriAI team.",
};

export default function ContactPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-20 px-6 relative">
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Get in Touch</h1>
                        <p className="text-lg text-gray-400">Have questions about NutriAI or want to provide feedback? We'd love to hear from you.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 glass-panel p-4 rounded-xl border-white/5">
                            <div className="p-3 bg-emerald-500/20 rounded-lg shrink-0">
                                <Mail className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Email Us</p>
                                <p className="text-white font-medium">support@nutriai.example.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 glass-panel p-4 rounded-xl border-white/5">
                            <div className="p-3 bg-blue-500/20 rounded-lg shrink-0">
                                <Phone className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Call Us</p>
                                <p className="text-white font-medium">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 glass-panel p-4 rounded-xl border-white/5">
                            <div className="p-3 bg-purple-500/20 rounded-lg shrink-0">
                                <MapPin className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Location</p>
                                <p className="text-white font-medium">San Francisco, CA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="glass-panel p-8 rounded-3xl relative">
                    <form className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Name</label>
                            <input
                                type="text"
                                placeholder="Jane Doe"
                                className="w-full glass-panel border bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-sans"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="jane@example.com"
                                className="w-full glass-panel border bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-sans"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Message</label>
                            <textarea
                                rows={4}
                                placeholder="How can we help?"
                                className="w-full glass-panel border bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none font-sans"
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-semibold py-3 rounded-xl transition-colors mt-2"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
