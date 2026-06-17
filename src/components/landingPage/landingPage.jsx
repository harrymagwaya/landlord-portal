// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';

import LoginOutlined from '@ant-design/icons/LoginOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import { LinkedinOutlined } from '@ant-design/icons';
import { FacebookOutlined } from '@ant-design/icons';
import { InstagramOutlined } from '@ant-design/icons';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import SyncOutlined from '@ant-design/icons/SyncOutlined';
import FileProtectOutlined from '@ant-design/icons/FileProtectOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';
import ThunderboltOutlined from '@ant-design/icons/ThunderboltOutlined';
import BankOutlined from '@ant-design/icons/BankOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';

// Scroll reveal wrapper
function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </Box>
  );
}

// Animated counter hook
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          let startTime = null;
          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return { count, ref };
}

function StatCounter({ target, label, suffix = '' }) {
  const { count, ref } = useCountUp(target);
  return (
    <Box ref={ref} textAlign="center">
      <Typography variant="h3" fontWeight={900} color="#0f172a">
        {count.toLocaleString()}
        {suffix}
      </Typography>
      <Typography color="text.secondary" mt={1} fontWeight={500}>
        {label}
      </Typography>
    </Box>
  );
}

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'How It Works', id: 'framework' },
    { label: 'For Tenants', id: 'tenants' },
    { label: 'For Landlords', id: 'landlords' },
    { label: 'For Lenders', id: 'lenders' },
    { label: 'Q&A', id: 'faq' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', overflow: 'hidden' }}>
      {/* NAVBAR */}
      <Box
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.9)' : '#fff',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid',
          borderColor: scrolled ? 'rgba(230,234,240,0.8)' : '#e6eaf0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.08)' : 'none'
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                }}
              >
                <HomeOutlined style={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.5px">
                RentScore
              </Typography>
            </Stack>

            <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map((link) => (
                <Typography
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                    transition: 'color 0.3s'
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: 2, fontWeight: 600 }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadOutlined />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Download App
              </Button>
              <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              </IconButton>
            </Stack>
          </Stack>

          {mobileMenuOpen && (
            <Box sx={{ display: { md: 'none' }, pb: 2 }}>
              {navLinks.map((link) => (
                <Typography
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    cursor: 'pointer',
                    fontWeight: 500,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'primary.50', color: 'primary.main' }
                  }}
                >
                  {link.label}
                </Typography>
              ))}
              <Button component={Link} to="/login" variant="outlined" fullWidth sx={{ mt: 1, borderRadius: 2 }}>
                Login
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1f6feb 100%)',
          color: '#fff',
          py: { xs: 10, md: 14 },
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: '#1f6feb',
            filter: 'blur(80px)',
            opacity: 0.4,
            top: -100,
            right: -100,
            animation: 'float 8s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: '#3b82f6',
            filter: 'blur(80px)',
            opacity: 0.3,
            bottom: -50,
            left: -50,
            animation: 'float 8s ease-in-out infinite 2s'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ animation: 'slideUp 0.8s ease-out' }}>
                <Chip
                  label="Real-Time Behavioral Credit Scoring"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    mb: 3,
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '& .MuiChip-label': { px: 2 }
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        bgcolor: '#4ade80',
                        borderRadius: '50%',
                        ml: 1.5,
                        animation: 'pulse 2s infinite'
                      }}
                    />
                  }
                />

                <Typography
                  variant="h2"
                  fontWeight={900}
                  sx={{
                    lineHeight: 1.1,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }
                  }}
                >
                  Turn Everyday
                  <br />
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #fff 0%, #93c5fd 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Financial Behavior
                  </Box>
                  <br />
                  Into Credit Access.
                </Typography>

                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 520, lineHeight: 1.6 }}>
                  For millions of thin-file and credit-invisible individuals in Uganda, formal credit remains out of reach. RentScore
                  transforms your rental payments, utility bills, mobile money transactions, and savings contributions into a real-time
                  behavioral credit profile.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={Link}
                    to="/login"
                    size="large"
                    variant="contained"
                    startIcon={<LoginOutlined />}
                    sx={{
                      bgcolor: '#fff',
                      color: '#0f172a',
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: '#f1f5f9',
                        transform: 'scale(1.05)',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Login to Portal
                  </Button>

                  <Button
                    size="large"
                    variant="outlined"
                    startIcon={<DownloadOutlined />}
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.4)',
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Download Tenant App
                  </Button>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 4 }}>
                  <Stack direction="row" spacing={-1}>
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar
                        key={i}
                        src={`https://i.pravatar.cc/150?img=${i + 10}`}
                        sx={{
                          width: 40,
                          height: 40,
                          border: '2px solid #fff',
                          ml: i > 1 ? -1.5 : 0
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <Box component="span" fontWeight={700} color="#fff">
                      10,000+
                    </Box>{' '}
                    users building credit profiles
                  </Typography>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  animation: 'fadeIn 1s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    p: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -16,
                      right: -16,
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 25px rgba(245,158,11,0.4)',
                      animation: 'float 6s ease-in-out infinite'
                    }}
                  >
                    <RiseOutlined style={{ color: '#fff', fontSize: 28 }} />
                  </Box>

                  <CardContent>
                    <Typography variant="h5" fontWeight={800} gutterBottom color="#fff">
                      Your financial behavior can open doors.
                    </Typography>

                    <Stack spacing={2.5} sx={{ mt: 3 }}>
                      <HeroPoint
                        icon={<CheckCircleOutlined style={{ color: '#93c5fd' }} />}
                        text="Pay rent and keep a clear payment record."
                        subtext="Automatic tracking of all your rental payments"
                      />
                      <HeroPoint
                        icon={<MobileOutlined style={{ color: '#93c5fd' }} />}
                        text="Track mobile money & daily transactions."
                        subtext="Unified dashboard for all your finances"
                      />
                      <HeroPoint
                        icon={<BankOutlined style={{ color: '#93c5fd' }} />}
                        text="View your behavioral eligibility score."
                        subtext="Real-time creditworthiness updates"
                      />
                      <HeroPoint
                        icon={<FileProtectOutlined style={{ color: '#93c5fd' }} />}
                        text="Help lenders understand your reliability."
                        subtext="Verified payment history for lenders"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>

        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f6f8fb"
            />
          </svg>
        </Box>
      </Box>

      {/* STATS */}
      <Box sx={{ py: 10, bgcolor: '#f6f8fb' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid item xs={6} md={3}>
              <StatCounter target={10000} label="Active Users" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCounter target={500} label="Properties Managed" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCounter target={50} label="Lending Partners" suffix="+" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCounter target={98} label="Satisfaction" suffix="%" />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* THE THREE SECTORS */}
      <Box id="tenants" sx={{ py: 12, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Box textAlign="center" mb={10}>
              <Chip
                label="Built for Everyone"
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.700',
                  fontWeight: 600,
                  mb: 2,
                  px: 1
                }}
              />
              <Typography variant="h3" fontWeight={900} color="#0f172a" gutterBottom>
                Three Sectors. One Mission.
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth={700} mx="auto">
                Whether you are building a credit profile, managing rental properties, or assessing risk — RentScore connects all parties
                through verified behavioral data.
              </Typography>
            </Box>
          </ScrollReveal>

          {/* SECTOR 1: TENANTS & INDIVIDUALS */}
          <Grid container spacing={6} alignItems="center" sx={{ mb: 12 }}>
            <Grid item xs={12} md={6}>
              <ScrollReveal>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    display: 'inline-block',
                    mb: 3
                  }}
                >
                  <MobileOutlined style={{ fontSize: 32, color: '#2563eb' }} />
                </Box>
                <Typography variant="h4" fontWeight={900} color="#0f172a" gutterBottom>
                  For Tenants & Everyday Users
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  From Credit-Invisible to Credit-Visible.
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                  Access to formal credit remains a significant challenge for thin-file populations in Uganda. Traditional systems rely on
                  bank statements, salary records, and collateral — leaving millions excluded. RentScore changes this by transforming your
                  everyday financial activities into a measurable credit profile.
                  <br />
                  <br />
                  Share your rental payments, utility bills (Umeme, NWSC), mobile money transactions, SACCO contributions, school fees, and
                  even social obligations like wedding and funeral support. Our Dynamic Weighted Behavioral Eligibility Algorithm converts
                  these patterns into a real-time score that lenders can trust.
                </Typography>

                <Stack spacing={2.5}>
                  <SectorFeature
                    icon={<CheckCircleOutlined style={{ color: '#2563eb' }} />}
                    title="Track Rent & Utilities"
                    desc="Keep clear records of rent, water, and electricity payments automatically."
                  />
                  <SectorFeature
                    icon={<WalletOutlined style={{ color: '#2563eb' }} />}
                    title="Build Your Loan Portfolio"
                    desc="Every verified payment strengthens your behavioral credit profile over time."
                  />
                  <SectorFeature
                    icon={<BarChartOutlined style={{ color: '#2563eb' }} />}
                    title="Check Eligibility in Real Time"
                    desc="View your dynamic eligibility score and probability of default estimates."
                  />
                  <SectorFeature
                    icon={<GlobalOutlined style={{ color: '#2563eb' }} />}
                    title="Access Better Loan Opportunities"
                    desc="Use your behavioral history to unlock formal credit from partner institutions."
                  />
                </Stack>
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScrollReveal delay={200}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 25px 60px rgba(15,23,42,0.12)',
                    border: '1px solid',
                    borderColor: 'grey.100',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ p: 4, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" fontWeight={800} color="primary.900" gutterBottom>
                      Your Behavioral Dashboard
                    </Typography>
                    <Typography color="primary.700" fontSize="0.9375rem">
                      Real-time view of your financial discipline
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <BehavioralMetric label="Rent Consistency" value={92} color="#2563eb" />
                      <BehavioralMetric label="Payment Timeliness" value={85} color="#16a34a" />
                      <BehavioralMetric label="Transaction Diversity" value={78} color="#9333ea" />
                      <BehavioralMetric label="Savings Behavior" value={64} color="#f59e0b" />
                    </Stack>
                    <Box
                      sx={{
                        mt: 4,
                        p: 3,
                        borderRadius: 3,
                        bgcolor: '#f0fdf4',
                        border: '1px solid',
                        borderColor: '#bbf7d0'
                      }}
                    >
                      <Typography fontWeight={700} color="#15803d" gutterBottom>
                        Eligibility Score: 847 / 1000
                      </Typography>
                      <Typography fontSize="0.875rem" color="#166534">
                        You are currently in the <strong>Low Risk</strong> tier. Continue meeting your recurring obligations to improve your
                        score.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </Grid>
          </Grid>

          {/* SECTOR 2: LANDLORDS */}
          <Box id="landlords" sx={{ mb: 12 }}>
            <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
              <Grid item xs={12} md={6}>
                <ScrollReveal delay={200}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 25px 60px rgba(15,23,42,0.12)',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ height: 280, bgcolor: '#f8fafc', p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar sx={{ bgcolor: '#0f172a', mr: 2 }}>JD</Avatar>
                          <Box>
                            <Typography fontWeight={700}>James Kennedy</Typography>
                            <Typography fontSize="0.875rem" color="text.secondary">
                              Property Manager — 12 Units
                            </Typography>
                          </Box>
                          <Chip label="Verified" size="small" sx={{ ml: 'auto', bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
                        </Box>
                        <Stack spacing={2}>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontSize="0.9375rem">Unit 4B — Sarah M.</Typography>
                              <Typography fontSize="0.875rem" fontWeight={700} color="#16a34a">
                                Paid on Time
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontSize="0.9375rem">Unit 2A — David C.</Typography>
                              <Typography fontSize="0.875rem" fontWeight={700} color="#eab308">
                                3 Days Late
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography fontSize="0.9375rem">Unit 5C — Maria L.</Typography>
                              <Typography fontSize="0.875rem" fontWeight={700} color="#16a34a">
                                Paid on Time
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" fontWeight={800} gutterBottom>
                        Property Management & Verification
                      </Typography>
                      <Typography color="text.secondary" fontSize="0.9375rem">
                        Manage your portfolio, assign tenants to units, and verify every payment. Your verification becomes trusted data
                        that helps tenants access formal credit.
                      </Typography>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </Grid>
              <Grid item xs={12} md={6}>
                <ScrollReveal>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      display: 'inline-block',
                      mb: 3
                    }}
                  >
                    <HomeOutlined style={{ fontSize: 32, color: '#16a34a' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={900} color="#0f172a" gutterBottom>
                    For Landlords & Property Managers
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Verify Payments. Build Trust.
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                    RentScore provides landlords with a structured rental management system that goes beyond rent collection. By verifying
                    tenant payments within the platform, you generate immutable, trusted records that serve as alternative collateral for
                    credit assessment.
                    <br />
                    <br />
                    Inspired by models like the Experian Rental Exchange, our system recognizes rental payment behavior as a critical
                    indicator of financial responsibility. Your verification helps thin-file tenants gradually build formal credit profiles
                    through consistent rental behavior.
                  </Typography>

                  <Stack spacing={2.5}>
                    <SectorFeature
                      icon={<HomeOutlined style={{ color: '#16a34a' }} />}
                      title="Manage Properties & Units"
                      desc="Register properties, assign tenants, and track lease agreements in one place."
                    />
                    <SectorFeature
                      icon={<FileProtectOutlined style={{ color: '#16a34a' }} />}
                      title="Verify Tenant Payments"
                      desc="Acknowledge and verify rent receipts to create trusted behavioral records."
                    />
                    <SectorFeature
                      icon={<BarChartOutlined style={{ color: '#16a34a' }} />}
                      title="Generate Behavioral Reports"
                      desc="Access tenant payment consistency reports and risk summaries."
                    />
                    <SectorFeature
                      icon={<TeamOutlined style={{ color: '#16a34a' }} />}
                      title="Reduce Default Risk"
                      desc="Identify reliable tenants using data-driven behavioral insights."
                    />
                  </Stack>
                </ScrollReveal>
              </Grid>
            </Grid>
          </Box>

          {/* SECTOR 3: LOAN ADMINS */}
          <Box id="lenders">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <ScrollReveal>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      display: 'inline-block',
                      mb: 3
                    }}
                  >
                    <SafetyOutlined style={{ fontSize: 32, color: '#d97706' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={900} color="#0f172a" gutterBottom>
                    For Loan Administrators & Lenders
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    Real-Time Behavioral Intelligence.
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                    Traditional credit scoring relies on static, historical banking records that exclude millions of financially responsible
                    individuals. RentScore offers an event-driven alternative: continuous behavioral snapshots streamed directly to your
                    risk dashboard.
                    <br />
                    <br />
                    Monitor eligibility scores, track payment fluidity, analyze expenditure velocity, and evaluate negative event recovery
                    patterns in real time. Our Dynamic Weighted Behavioral Eligibility Algorithm converts live transactional data into
                    Probability of Default (PD) estimates — enabling faster, fairer, and more inclusive lending decisions.
                  </Typography>

                  <Stack spacing={2.5}>
                    <SectorFeature
                      icon={<SyncOutlined style={{ color: '#d97706' }} />}
                      title="Daily Behavioral Snapshots"
                      desc="Receive automated, streaming updates on tenant financial behavior every day."
                    />
                    <SectorFeature
                      icon={<BarChartOutlined style={{ color: '#d97706' }} />}
                      title="Dynamic Risk Analysis"
                      desc="Track eligibility scores, volatility metrics, and resilience indicators live."
                    />
                    <SectorFeature
                      icon={<ThunderboltOutlined style={{ color: '#d97706' }} />}
                      title="Event-Driven Data Streams"
                      desc="Transactions are captured and processed in real time via pub-sub architecture."
                    />
                    <SectorFeature
                      icon={<FileProtectOutlined style={{ color: '#d97706' }} />}
                      title="Explainable Scoring Decisions"
                      desc="Trace every score back to verified behavioral events for full transparency."
                    />
                  </Stack>
                </ScrollReveal>
              </Grid>
              <Grid item xs={12} md={6}>
                <ScrollReveal delay={200}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: '0 25px 60px rgba(15,23,42,0.12)',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      overflow: 'hidden',
                      background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%)',
                      color: '#fff'
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" fontWeight={800} gutterBottom color="#fff">
                        Live Risk Dashboard
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, fontSize: '0.9375rem' }}>
                        Real-time event-driven behavioral monitoring
                      </Typography>

                      <Stack spacing={3}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography fontSize="0.9375rem" color="rgba(255,255,255,0.9)">
                              Portfolio Risk Level
                            </Typography>
                            <Typography fontWeight={700} color="#4ade80">
                              Low
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <Box sx={{ width: '78%', height: '100%', bgcolor: '#4ade80', borderRadius: 4 }} />
                          </Box>
                        </Box>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography fontSize="0.9375rem" color="rgba(255,255,255,0.9)">
                              Avg. Eligibility Score
                            </Typography>
                            <Typography fontWeight={700} color="#60a5fa">
                              847/1000
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <Box sx={{ width: '84%', height: '100%', bgcolor: '#60a5fa', borderRadius: 4 }} />
                          </Box>
                        </Box>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography fontSize="0.9375rem" color="rgba(255,255,255,0.9)">
                              Behavioral Data Velocity
                            </Typography>
                            <Typography fontWeight={700} color="#fbbf24">
                              High
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                            <Box sx={{ width: '92%', height: '100%', bgcolor: '#fbbf24', borderRadius: 4 }} />
                          </Box>
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          mt: 4,
                          p: 3,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <Typography fontSize="0.875rem" color="rgba(255,255,255,0.8)">
                          <strong style={{ color: '#fff' }}>Latest Snapshot:</strong> 12 minutes ago
                          <br />
                          234 new verified transactions processed from 89 active tenants.
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* BEHAVIORAL FRAMEWORK */}
      <Box id="framework" sx={{ py: 12, bgcolor: '#f6f8fb' }}>
        <Container maxWidth="lg">
          <ScrollReveal>
            <Box textAlign="center" mb={8}>
              <Chip
                label="The Framework"
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.700',
                  fontWeight: 600,
                  mb: 2,
                  px: 1
                }}
              />
              <Typography variant="h3" fontWeight={900} color="#0f172a" gutterBottom>
                How the Scoring Engine Works
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth={700} mx="auto">
                Our Dynamic Weighted Behavioral Eligibility Algorithm transforms everyday financial signals into measurable credit risk
                indicators.
              </Typography>
            </Box>
          </ScrollReveal>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ScrollReveal delay={0}>
                <FrameworkCard
                  icon={<HomeOutlined />}
                  title="Rent: The Commitment"
                  description="Rent is a recurring, contractually binding obligation. We evaluate payment punctuality, frequency of delays, tenancy duration, and payment fragmentation to estimate long-term financial discipline."
                  color="#2563eb"
                />
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={4}>
              <ScrollReveal delay={150}>
                <FrameworkCard
                  icon={<WalletOutlined />}
                  title="Daily Spend: The Lifestyle"
                  description="Expenditure velocity, balance retention, mobile money patterns, and transaction diversity reveal how users manage liquidity. Stable habits indicate resilience; erratic depletion signals vulnerability."
                  color="#16a34a"
                />
              </ScrollReveal>
            </Grid>
            <Grid item xs={12} md={4}>
              <ScrollReveal delay={300}>
                <FrameworkCard
                  icon={<SafetyOutlined />}
                  title="Negative Events: The Recovery"
                  description="Failed transactions, bounced payments, and arrears are captured not as binary failures, but as recovery patterns. Time-to-resolution and responsiveness reveal true financial accountability."
                  color="#d97706"
                />
              </ScrollReveal>
            </Grid>
          </Grid>

          <ScrollReveal>
            <Box
              sx={{
                mt: 6,
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                bgcolor: '#fff',
                boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
                border: '1px solid',
                borderColor: 'grey.100',
                textAlign: 'center'
              }}
            >
              <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 3 }}>
                <Chip
                  icon={<SyncOutlined style={{ fontSize: 16, color: '#2563eb' }} />}
                  label="Event-Driven"
                  sx={{ bgcolor: 'primary.50', color: 'primary.700', fontWeight: 600 }}
                />
                <Chip
                  icon={<ThunderboltOutlined style={{ fontSize: 16, color: '#16a34a' }} />}
                  label="Real-Time"
                  sx={{ bgcolor: 'success.50', color: 'success.700', fontWeight: 600 }}
                />
                <Chip
                  icon={<FileProtectOutlined style={{ fontSize: 16, color: '#d97706' }} />}
                  label="Explainable"
                  sx={{ bgcolor: 'warning.50', color: 'warning.800', fontWeight: 600 }}
                />
              </Stack>

              <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
                Configurable, Explainable, and Auditable
              </Typography>
              <Typography color="text.secondary" maxWidth={700} mx="auto" sx={{ mb: 5, lineHeight: 1.7 }}>
                RentScore employs a proprietary multi-criteria behavioral assessment engine. Every eligibility rating is accompanied by a
                transparent reasoning trail — showing exactly which behavioral patterns contributed to the assessment, without exposing the
                underlying proprietary weighting logic.
              </Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="center" spacing={1}>
                {[
                  {
                    icon: <FileProtectOutlined />,
                    title: 'Immutable Event Logs',
                    desc: 'Traceable from capture to scoring',
                    color: '#2563eb',
                    bg: '#eff6ff'
                  },
                  {
                    icon: <BarChartOutlined />,
                    title: 'Reasoning Trail',
                    desc: 'See which behaviors drive your score',
                    color: '#16a34a',
                    bg: '#f0fdf4'
                  },
                  {
                    icon: <SafetyOutlined />,
                    title: 'Configurable Parameters',
                    desc: 'Adapt to lender policies',
                    color: '#d97706',
                    bg: '#fef3c7'
                  }
                ].map((item, idx) => (
                  <Stack key={item.title} direction="row" alignItems="center" spacing={1}>
                    <Card
                      sx={{
                        width: 260,
                        p: 3,
                        borderRadius: 3,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'grey.100',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: item.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          color: item.color,
                          fontSize: 24
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography fontWeight={800} color="#0f172a" fontSize="1rem" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography fontSize="0.875rem" color="text.secondary" lineHeight={1.6}>
                        {item.desc}
                      </Typography>
                    </Card>
                    {idx < 2 && (
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, color: 'grey.300', px: 1 }}>
                        <ArrowRightOutlined style={{ fontSize: 24 }} />
                      </Box>
                    )}
                    {idx < 2 && (
                      <Box sx={{ display: { xs: 'flex', md: 'none' }, color: 'grey.300', py: 0.5 }}>
                        <DownOutlined style={{ fontSize: 20 }} />
                      </Box>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          </ScrollReveal>
        </Container>
      </Box>

      {/* FAQ / Q&A */}
      <Box id="faq" sx={{ py: 12, bgcolor: '#fff' }}>
        <Container maxWidth="md">
          <ScrollReveal>
            <Box textAlign="center" mb={8}>
              <Chip
                label="Q&A"
                sx={{
                  bgcolor: 'primary.50',
                  color: 'primary.700',
                  fontWeight: 600,
                  mb: 2,
                  px: 1
                }}
              />
              <Typography variant="h3" fontWeight={900} color="#0f172a" gutterBottom>
                Common Questions
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Understanding behavioral credit scoring and how RentScore works.
              </Typography>
            </Box>
          </ScrollReveal>

          <ScrollReveal>
            <Stack spacing={2}>
              <FaqItem
                question="What limitations exist in traditional credit scoring?"
                answer="Traditional systems rely on bank statements, salary records, collateral, and historical borrowing behavior. This excludes thin-file and credit-invisible individuals who may lack formal documentation despite being financially responsible. In Uganda, large segments operate outside formal banking systems, making conventional models ineffective."
              />
              <FaqItem
                question="Can rental payments and everyday transactions really improve credit assessment?"
                answer="Yes. Academic research and commercial platforms like Experian's Rental Exchange have demonstrated that recurring financial obligations — particularly rent, utilities, and mobile money patterns — provide strong signals of financial discipline and repayment capacity. Our framework builds on this evidence using real-time behavioral analytics."
              />
              <FaqItem
                question="What financial activities does RentScore track?"
                answer="The system captures rental payments, utility bills (Umeme, NWSC), mobile money transactions, SACCO contributions, savings deposits, school fees, airtime purchases, and even high-priority social obligations like wedding and funeral contributions. These reflect real-world financial weight and community reliability."
              />
              <FaqItem
                question="How does the Dynamic Weighted Behavioral Eligibility Algorithm work?"
                answer="The algorithm assigns configurable weights to three behavioral pillars: Rent Consistency (Rc), Rent Timeliness (Rt), and Verified Behavioral Interaction (Vb). These are combined into an Eligibility Score (ES) that estimates Probability of Default (PD) without relying on traditional credit bureau data."
              />
              <FaqItem
                question="Who can use RentScore?"
                answer="Three primary user groups: (1) Tenants and everyday individuals who want to build a credit profile from their daily payments; (2) Landlords and property managers who need a rental system and want to verify tenant payments; and (3) Loan administrators and financial institutions who need real-time behavioral snapshots for risk analysis."
              />
              <FaqItem
                question="How real-time is the data for lenders?"
                answer="The system uses an event-driven architecture with publish-subscribe communication. As soon as a tenant makes a payment and a landlord verifies it, the behavioral snapshot updates instantly. Loan administrators receive daily streaming updates and can monitor eligibility changes as they happen."
              />
              <FaqItem
                question="Is my financial data secure?"
                answer="Absolutely. The system employs two-sided behavioral verification — every transaction requires both tenant initiation and landlord confirmation before it enters the scoring engine. Additionally, immutable event logs improve transparency and auditability for all parties."
              />
              <FaqItem
                question="How is this different from apps like Tala or Branch?"
                answer="While Tala and Branch rely heavily on smartphone metadata and digital footprints, RentScore focuses on substantive, recurring financial obligations. We track the magnitude and timeliness of real-world commitments rather than device usage patterns, offering a more stable and context-specific measure of financial responsibility."
              />
            </Stack>
          </ScrollReveal>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 10, bgcolor: '#f6f8fb' }}>
        <Container maxWidth="md">
          <ScrollReveal>
            <Card
              sx={{
                borderRadius: 5,
                p: { xs: 4, md: 8 },
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(96, 165, 250, 0.15)'
                }}
              />

              <Box position="relative" zIndex={1}>
                <Typography variant="h3" fontWeight={900} gutterBottom>
                  Ready to get started?
                </Typography>
                <Typography sx={{ mt: 1, mb: 4, opacity: 0.9, fontSize: '1.125rem', maxWidth: 500, mx: 'auto' }}>
                  Join tenants, landlords, and lenders who are building a more inclusive credit ecosystem.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: '#fff',
                      color: '#0f172a',
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#f1f5f9', transform: 'scale(1.05)' },
                      transition: 'all 0.3s'
                    }}
                  >
                    Login to Portal
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.4)',
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    Download App
                  </Button>
                </Stack>

                <Typography sx={{ mt: 3, opacity: 0.7, fontSize: '0.875rem' }}>
                  No credit card required. Start building your behavioral profile today.
                </Typography>
              </Box>
            </Card>
          </ScrollReveal>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ bgcolor: '#0f172a', color: '#fff', pt: 10, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} mb={8}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <HomeOutlined style={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
                  RentScore
                </Typography>
              </Stack>
              <Typography color="grey.400" sx={{ mb: 3, lineHeight: 1.7 }}>
                Building trust through transparent financial behavior. Empowering tenants, landlords, and lenders with verified, real-time
                behavioral data for inclusive credit assessment.
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <SocialButton icon={<GlobalOutlined />} />
                <SocialButton icon={<LinkedinOutlined />} />
                <SocialButton icon={<FacebookOutlined />} />
                <SocialButton icon={<InstagramOutlined />} />
              </Stack>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" fontWeight={700} mb={3} fontSize="1.125rem">
                Platform
              </Typography>
              <Stack spacing={2}>
                {['For Tenants', 'For Landlords', 'For Lenders', 'Behavioral API', 'Documentation'].map((item) => (
                  <FooterLink key={item} text={item} />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" fontWeight={700} mb={3} fontSize="1.125rem">
                Company
              </Typography>
              <Stack spacing={2}>
                {['About Us', 'Research', 'Blog', 'Careers', 'Partners'].map((item) => (
                  <FooterLink key={item} text={item} />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" fontWeight={700} mb={3} fontSize="1.125rem">
                Support
              </Typography>
              <Stack spacing={2}>
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Security'].map((item) => (
                  <FooterLink key={item} text={item} />
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(30, 58, 138, 0.3)', mb: 4 }} />

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography color="grey.500" fontSize="0.875rem">
              2026 RentScore. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography color="grey.500" fontSize="0.875rem" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ color: '#4ade80', display: 'flex', alignItems: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 16 }} />
                </Box>
                Event-Driven Verified
              </Typography>
              <Typography color="grey.500" fontSize="0.875rem" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ color: '#4ade80', display: 'flex', alignItems: 'center' }}>
                  <SafetyOutlined style={{ fontSize: 16 }} />
                </Box>
                256-bit Encryption
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

// Sub-components

function HeroPoint({ icon, text, subtext }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.05)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        transition: 'background 0.3s'
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: 'rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={600} color="#fff">
          {text}
        </Typography>
        <Typography color="rgba(255,255,255,0.6)" fontSize="0.875rem" mt={0.5}>
          {subtext}
        </Typography>
      </Box>
    </Stack>
  );
}

function SectorFeature({ icon, title, desc }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight={700} color="#0f172a" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" fontSize="0.9375rem" lineHeight={1.6}>
          {desc}
        </Typography>
      </Box>
    </Stack>
  );
}

function BehavioralMetric({ label, value, color }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography fontSize="0.9375rem" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        <Typography fontWeight={700} color={color}>
          {value}%
        </Typography>
      </Stack>
      <Box sx={{ height: 8, bgcolor: 'grey.100', borderRadius: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            width: `${value}%`,
            height: '100%',
            bgcolor: color,
            borderRadius: 4,
            transition: 'width 1s ease-out'
          }}
        />
      </Box>
    </Box>
  );
}

function FrameworkCard({ icon, title, description, color }) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 25px 50px rgba(15,23,42,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            bgcolor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            mb: 3
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function FaqItem({ question, answer }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
          borderColor: 'primary.200'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<DownOutlined style={{ color: '#2563eb' }} />}
        sx={{
          px: 3,
          py: 1,
          '& .MuiAccordionSummary-content': { my: 1.5 }
        }}
      >
        <Typography fontWeight={700} color="#0f172a">
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, pb: 3 }}>
        <Typography color="text.secondary" lineHeight={1.7}>
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}

function FooterLink({ text }) {
  return (
    <Typography
      component="a"
      href="#"
      sx={{
        color: 'grey.400',
        textDecoration: 'none',
        fontSize: '0.9375rem',
        display: 'inline-block',
        position: 'relative',
        '&:hover': {
          color: '#fff',
          '&::after': { width: '100%' }
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: 0,
          height: 2,
          bgcolor: '#2563eb',
          transition: 'width 0.3s'
        },
        transition: 'color 0.3s'
      }}
    >
      {text}
    </Typography>
  );
}

function SocialButton({ icon }) {
  return (
    <IconButton
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        bgcolor: 'rgba(30, 58, 138, 0.5)',
        color: 'grey.400',
        '&:hover': {
          bgcolor: 'rgba(30, 58, 138, 0.8)',
          color: '#fff',
          transform: 'translateY(-3px)'
        },
        transition: 'all 0.3s'
      }}
    >
      {icon}
    </IconButton>
  );
}
