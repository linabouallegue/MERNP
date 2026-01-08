import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI, optimizeAICoverLetter } from '../services/api';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'optimizer'

    // STATES CHAT
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! Je suis ton coach carrière IA. Comment puis-je t\'aider aujourd\'hui ? (Ex: préparation entretien, conseils CV, lettre de motivation...)' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // STATES OPTIMIZER
    const [optimizerData, setOptimizerData] = useState({
        internshipTitle: '',
        coverLetter: ''
    });
    const [optimizedLetter, setOptimizedLetter] = useState('');
    const [optLoading, setOptLoading] = useState(false);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // HANDLERS CHAT
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { role: 'user', content: inputMessage };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setChatLoading(true);

        try {
            // Envoyer l'historique récent pour le contexte (max 5 derniers messages)
            const history = messages.slice(-5);
            const data = await chatWithAI({ message: userMsg.content, history });

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (err) {
            console.error('Erreur chat:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré une erreur. Réessaie plus tard." }]);
        } finally {
            setChatLoading(false);
        }
    };

    // HANDLERS OPTIMIZER
    const handleOptimize = async (e) => {
        e.preventDefault();
        setOptLoading(true);
        try {
            const data = await optimizeAICoverLetter(optimizerData);
            if (data.success) {
                setOptimizedLetter(data.optimizedLetter);
            }
        } catch (err) {
            console.error('Erreur optimisation:', err);
            alert('Erreur lors de l\'optimisation');
        } finally {
            setOptLoading(false);
        }
    };

    return (
        <div className="ai-assistant-page container fadeIn">
            <header className="page-header text-center">
                <h1>Assistant <span className="text-gradient">Carrière IA</span> 🤖</h1>
                <p>Ton coach personnel pour décrocher le stage de tes rêves.</p>
            </header>

            <div className="ai-tabs">
                <button
                    className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    💬 Career Chat
                </button>
                <button
                    className={`ai-tab ${activeTab === 'optimizer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('optimizer')}
                >
                    ✨ Optimiseur Lettre
                </button>
            </div>

            <div className="ai-content glass">
                {activeTab === 'chat' ? (
                    <div className="chat-interface">
                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.role}`}>
                                    <div className="message-bubble">
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="message assistant">
                                    <div className="message-bubble typing">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Pose une question..."
                            />
                            <button type="submit" disabled={chatLoading} className="btn btn-primary">
                                Envoyer
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="optimizer-interface">
                        <div className="optimizer-grid">
                            <form onSubmit={handleOptimize} className="premium-form">
                                <div className="form-group">
                                    <label>Titre du stage visé</label>
                                    <input
                                        type="text"
                                        value={optimizerData.internshipTitle}
                                        onChange={(e) => setOptimizerData({ ...optimizerData, internshipTitle: e.target.value })}
                                        placeholder="Ex: Développeur React"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ta lettre actuelle (Brouillon)</label>
                                    <textarea
                                        rows="10"
                                        value={optimizerData.coverLetter}
                                        onChange={(e) => setOptimizerData({ ...optimizerData, coverLetter: e.target.value })}
                                        placeholder="Colle ton brouillon ici..."
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={optLoading} className="btn btn-primary w-100">
                                    {optLoading ? 'Optimisation...' : 'Améliorer avec l\'IA ✨'}
                                </button>
                            </form>

                            <div className="result-area">
                                <h3>Version Optimisée</h3>
                                {optimizedLetter ? (
                                    <div className="optimized-content fadeIn">
                                        <pre>{optimizedLetter}</pre>
                                        <button
                                            className="btn btn-outline btn-sm mt-3"
                                            onClick={() => navigator.clipboard.writeText(optimizedLetter)}
                                        >
                                            Copier le texte
                                        </button>
                                    </div>
                                ) : (
                                    <div className="empty-placeholder">
                                        <p>Le résultat apparaîtra ici après l'analyse.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
