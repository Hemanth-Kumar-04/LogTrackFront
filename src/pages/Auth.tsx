import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Package, Truck, Globe, Shield } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const features = [
    {
      icon: Package,
      title: "Document Management",
      description: "Automatically extract data from shipping documents"
    },
    {
      icon: Truck,
      title: "Real-time Tracking",
      description: "Track shipments across the entire logistics chain"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with logistics partners worldwide"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Features */}
        <div className="text-foreground space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">LogiTrack</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-md">
              Streamline your logistics operations with intelligent document processing and real-time tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="flex items-start space-x-3 animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex items-center justify-center">
          {isLogin ? (
            <LoginForm onToggle={toggleForm} />
          ) : (
            <RegisterForm onToggle={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;