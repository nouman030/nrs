'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { pricingCards } from '@/lib/constants';
import clsx from 'clsx';
import { Check, ArrowRight, Zap, Building2, Users, BarChart, Code, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from '@/components/num';

// Note: No need to import useTheme as it wasn't being used to conditionally render styles.
// The fix is to use theme-aware Tailwind classes instead.

export default function Home() {
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const { ref: aboutRef, inView: aboutInView } = useInView({ triggerOnce: true, threshold: 0.4 });

  // This check is good practice, but this variable is not used in the JSX below.
  const planId = process.env.RAZORPAY_PLAN_199 || 'plan_PwNt8gRjS5XuhW';
  if (!planId) {
    return <div>Plan ID is not defined.</div>;
  }

  const features = [
    {
      icon: Building2,
      title: 'Agency Management',
      description: 'Manage multiple agencies and clients from a single dashboard',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless collaboration with role-based access control',
    },
    {
      icon: Globe,
      title: 'Website & Funnel Builder',
      description: 'Create stunning websites and high-converting funnels with our drag-and-drop builder',
    },
    {
      icon: BarChart,
      title: 'Performance Metrics',
      description: 'Track funnel performance and agency metrics with detailed graphs and charts',
    },
  ];

  const stats = [
    { number: 500, label: 'Agencies Powered' },
    { number: 50000, label: 'Websites Built' },
    { number: 99.9, label: 'Uptime' },
    { number: 247, label: 'Support', text: '24/7' }, // Fixed 24/7 display issue
  ];

  return (
    <div className="relative">
      {/* Floating Navigation Commented Out */}

      {/* Hero Section - Enhanced & Theme-Fixed */}
      <section className="min-h-screen w-full relative flex items-center justify-center flex-col bg-background overflow-hidden">
        {/* Cyberpunk-style grid background - Corrected for Light/Dark Mode */}
        <div className="absolute inset-0">
          {/* Light mode grid with dark lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          {/* Dark mode grid with lighter lines (overrides light mode) */}
          <div className="absolute inset-0 dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] dark:bg-[size:2rem_2rem] dark:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-transparent dark:from-primary/10 dark:via-transparent dark:to-secondary/10" />
          <div className="absolute inset-0 backdrop-blur-3xl opacity-10 dark:opacity-30" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0 bg-[url('/assets/circuit-pattern.svg')] bg-repeat opacity-5"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 pt-[80px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] flex justify-center items-center mx-auto">
              Next Generation Website Builder
            </span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 1 }}
            className="relative mb-8"
          >
            <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
              <h1 className="text-5xl font-bold text-center md:text-[150px]">NRS</h1>
            </div>
          </motion.div>

          <div ref={heroRef} className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
              className="text-center space-y-8"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Experience the next evolution in website creation. Our AI-powered platform combines cutting-edge technology with intuitive design to help you build extraordinary digital experiences.
              </motion.p>

              <motion.div className="flex items-center justify-center gap-4 pt-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/agency"
                    className="group relative inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium overflow-hidden"
                  >
                    <span className="relative z-10">Start Building</span>
                    
                    <ArrowRight className="ml-2 h-5 w-5 relative z-10" />
                  </Link>
                </motion.div>

                <motion.a
                  href="#features"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl text-foreground border border-border hover:bg-muted transition-colors backdrop-blur-sm"
                >
                  Learn More
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Tech decoration elements */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-l from-primary/10 to-secondary/10 rounded-full blur-[120px]"
        />
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-16 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    {stat.text ? stat.text : <CountUp from={0} to={stat.number} />}
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section id="features" ref={featuresRef} className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to help you manage and grow your agency
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative p-6 rounded-xl bg-card border hover:shadow-lg hover:shadow-primary/10 transition-shadow"
              >
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
     
      {/* About Section */}
      <section ref={aboutRef} className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: aboutInView ? 1 : 0, y: aboutInView ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose NRS Studio?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Built for Agencies</h3>
                    <p className="text-muted-foreground">
                      Specifically designed for digital agencies and their unique needs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Lightning Fast</h3>
                    <p className="text-muted-foreground">
                      Optimized for performance with next-gen technology
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Team Collaboration</h3>
                    <p className="text-muted-foreground">
                      Work seamlessly with your team and clients
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/assets/preview.png"
                alt="About NRS Studio"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">
              Choose the perfect plan for your agency's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={clsx('relative', {
                  'border-2 border-primary': card.title === 'Unlimited Saas',
                })}>
                  {card.title === 'Unlimited Saas' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{card.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <div className="space-y-2">
                      {card.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/agency"
                      className={clsx(
                        'w-full text-center py-2 rounded-lg transition-colors',
                        {
                          'bg-primary text-primary-foreground hover:bg-primary/90':
                            card.title === 'Unlimited Saas',
                          'bg-secondary text-secondary-foreground hover:bg-secondary/90':
                            card.title !== 'Unlimited Saas',
                        }
                      )}
                    >
                      Get Started
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Integrations</li>
                <li>Updates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>API Reference</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NRS Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}