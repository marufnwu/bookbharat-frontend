'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { marketingConfigService, type AnalyticsConfig, type PixelsConfig } from '@/lib/marketing-config';

interface TrackingScriptsProps {
  // Optional: Force load scripts even in development
  forceLoad?: boolean;
}

/**
 * TrackingScripts Component
 *
 * This component injects analytics and tracking scripts based on backend configuration.
 * It provides centralized control over all tracking pixels and analytics tools.
 */
export function TrackingScripts({ forceLoad = false }: TrackingScriptsProps) {
  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig | null>(null);
  const [pixelsConfig, setPixelsConfig] = useState<PixelsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip loading in development unless forced
    if (process.env.NODE_ENV === 'development' && !forceLoad) {
      setIsLoading(false);
      return;
    }

    const loadConfigs = async () => {
      try {
        const [analytics, pixels] = await Promise.all([
          marketingConfigService.getAnalyticsConfig(),
          marketingConfigService.getPixelsConfig(),
        ]);

        setAnalyticsConfig(analytics);
        setPixelsConfig(pixels);
      } catch (err) {
        console.error('Failed to load marketing configs:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigs();
  }, [forceLoad]);

  // Don't render anything while loading or in development (unless forced)
  if (isLoading || (process.env.NODE_ENV === 'development' && !forceLoad)) {
    return null;
  }

  // Show error in development
  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-sm">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!analyticsConfig || !pixelsConfig) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      {analyticsConfig.google_analytics.enabled && analyticsConfig.google_analytics.measurement_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.google_analytics.measurement_id}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsConfig.google_analytics.measurement_id}', {
                ${analyticsConfig.google_analytics.debug_mode ? 'debug_mode: true,' : ''}
                ${analyticsConfig.google_analytics.anonymize_ip ? 'anonymize_ip: true,' : ''}
                cookie_flags: '${analyticsConfig.google_analytics.cookie_flags || ''}',
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {analyticsConfig.google_tag_manager.enabled && analyticsConfig.google_tag_manager.container_id && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${analyticsConfig.google_tag_manager.container_id}');
            `}
          </Script>
        </>
      )}

      {/* Hotjar */}
      {analyticsConfig.hotjar.enabled && analyticsConfig.hotjar.site_id && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${analyticsConfig.hotjar.site_id},hjsv:${analyticsConfig.hotjar.snippet_version || 6}};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* Mixpanel */}
      {analyticsConfig.mixpanel.enabled && analyticsConfig.mixpanel.token && (
        <Script id="mixpanel" strategy="afterInteractive">
          {`
            (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=c.hash,g=function(){return m=function(h){return h.split('/')[2].replace('~','.')},(f&&f.length>0&&(g=m(f),j!=g))&&b.pushState({},"",c.pathname+g));j=g()}catch(l){}var p=window.Hotline=function(){(p.q=p.q||[]).push(arguments)};p.l=+new Date;p.o=function(){return p.q.length},p.l=new Date;p.q=function(){return p.q=[]};p.s=function(){return p.l};p.t=function(h){return p.l=h},p.i=function(h){return p.q.length+1,h},p.r=function(){return p.q.concat(h)},p.h=function(h){return p.q.slice(0,h)},p.u=function(){return[]},p.v=function(h){return p.q.concat(Array(h-1))},p.w=function(){return p.q.concat(Array(arguments).slice(1))},p.x=function(h){return p.q.concat(h)},p.y=function(){return p.q},p.z=function(){return p.q.length},p.A=function(){},p.B=function(){return p.q},p.C=function(){},p.D=function(){},p.E=function(){},p.F=function(){},p.G=function(){},p.H=function(){},p.I=function(){},p.J=function(){},p.K=function(){},p.L=function(){},p.M=function(){},p.N=function(){},p.O=function(){},p.P=function(){},p.Q=function(){},p.R=function(){},p.S=function(){},p.T=function(){},p.U=function(){},p.V=function(){},p.W=function(){},p.X=function(){},p.Y=function(){},p.Z=function(){},p._=function(){},p.$=function(){},p.aa=function(){},p.ab=function(){},p.ac=function(){},p.ad=function(){},p.ae=function(){},p.af=function(){},p.ag=function(){},p.ah=function(){},p.ai=function(){},p.aj=function(){},p.ak=function(){},p.al=function(){},p.am=function(){},p.an=function(){},p.ao=function(){},p.ap=function(){},p.aq=function(){},p.ar=function(){},p.as=function(){},p.at=function(){},p.au=function(){},p.av=function(){},p.aw=function(){},p.ax=function(){},p.ay=function(){},p.az=function(){},p.ba=function(){},p.bb=function(){},p.bc=function(){},p.bd=function(){},p.be=function(){},p.bf=function(){},p.bg=function(){},p.bh=function(){},p.bi=function(){},p.bj=function(){},p.bk=function(){},p.bl=function(){},p.bm=function(){},p.bn=function(){},p.bo=function(){},p.bp=function(){},p.bq=function(){},p.br=function(){},p.bs=function(){},p.bt=function(){},p.bu=function(){},p.bv=function(){},p.bw=function(){},p.bx=function(){},p.by=function(){},p.bz=function(){},p.ca=function(){},p.cb=function(){},p.cc=function(){},p.cd=function(){},p.ce=function(){},p.cf=function(){},p.cg=function(){},p.ch=function(){},p.ci=function(){},p.cj=function(){},p.ck=function(){},p.cl=function(){},p.cm=function(){},p.cn=function(){},p.co=function(){},p.cp=function(){},p.cq=function(){},p.cr=function(){},p.cs=function(){},p.ct=function(){},p.cu=function(){},p.cv=function(){},p.cw=function(){},p.cx=function(){},p.cy=function(){},p.cz=function(){},p.da=function(){},p.db=function(){},p.dc=function(){},p.dd=function(){},p.de=function(){},p.df=function(){},p.dg=function(){},p.dh=function(){},p.di=function(){},p.dj=function(){},p.dk=function(){},p.dl=function(){},p.dm=function(){},p.dn=function(){},p.do=function(){},p.dp=function(){},p.dq=function(){},p.dr=function(){},p.ds=function(){},p.dt=function(){},p.du=function(){},p.dv=function(){},p.dw=function(){},p.dx=function(){},p.dy=function(){},p.dz=function(){},p.ea=function(){},p.eb=function(){},p.ec=function(){},p.ed=function(){},p.ee=function(){},p.ef=function(){},p.eg=function(){},p.eh=function(){},p.ei=function(){},p.ej=function(){},p.ek=function(){},p.el=function(){},p.em=function(){},p.en=function(){},p.eo=function(){},p.ep=function(){},p.eq=function(){},p.er=function(){},p.es=function(){},p.et=function(){},p.eu=function(){},p.ev=function(){},p.ew=function(){},p.ex=function(){},p.ey=function(){},p.ez=function(){},p.fa=function(){},p.fb=function(){},p.fc=function(){},p.fd=function(){},p.fe=function(){},p.ff=function(){},p.fg=function(){},p.fh=function(){},p.fi=function(){},p.fj=function(){},p.fk=function(){},p.fl=function(){},p.fm=function(){},p.fn=function(){},p.fo=function(){},p.fp=function(){},p.fq=function(){},p.fr=function(){},p.fs=function(){},p.ft=function(){},p.fu=function(){},p.fv=function(){},p.fw=function(){},p.fx=function(){},p.fy=function(){},p.fz=function(){},p.ga=function(){},p.gb=function(){},p.gc=function(){},p.gd=function(){},p.ge=function(){},p.gf=function(){},p.gg=function(){},p.gh=function(){},p.gi=function(){},p.gj=function(){},p.gk=function(){},p.gl=function(){},p.gm=function(){},p.gn=function(){},p.go=function(){},p.gp=function(){},p.gq=function(){},p.gr=function(){},p.gs=function(){},p.gt=function(){},p.gu=function(){},p.gv=function(){},p.gw=function(){},p.gx=function(){},p.gy=function(){},p.gz=function(){},p.ha=function(){},p.hb=function(){},p.hc=function(){},p.hd=function(){},p.he=function(){},p.hf=function(){},p.hg=function(){},p.hh=function(){},p.hi=function(){},p.hj=function(){},p.hk=function(){},p.hl=function(){},p.hm=function(){},p.hn=function(){},p.ho=function(){},p.hp=function(){},p.hq=function(){},p.hr=function(){},p.hs=function(){},p.ht=function(){},p.hu=function(){},p.hv=function(){},p.hw=function(){},p.hx=function(){},p.hy=function(){},p.hz=function(){},p.ia=function(){},p.ib=function(){},p.ic=function(){},p.id=function(){},p.ie=function(){},p.if=function(){},p.ig=function(){},p.ih=function(){},p.ii=function(){},p.ij=function(){},p.ik=function(){},p.il=function(){},p.im=function(){},p.in=function(){},p.io=function(){},p.ip=function(){},p.iq=function(){},p.ir=function(){},p.is=function(){},p.it=function(){},p.iu=function(){},p.iv=function(){},p.iw=function(){},p.ix=function(){},p.iy=function(){},p.iz=function(){},p.ja=function(){},p.jb=function(){},p.jc=function(){},p.jd=function(){},p.je=function(){},p.jf=function(){},p.jg=function(){},p.jh=function(){},p.ji=function(){},p.jj=function(){},p.jk=function(){},p.jl=function(){},p.jm=function(){},p.jn=function(){},p.jo=function(){},p.jp=function(){},p.jq=function(){},p.jr=function(){},p.js=function(){},p.jt=function(){},p.ju=function(){},p.jv=function(){},p.jw=function(){},p.jx=function(){},p.jy=function(){},p.jz=function(){},p.ka=function(){},p.kb=function(){},p.kc=function(){},p.kd=function(){},p.ke=function(){},p.kf=function(){},p.kg=function(){},p.kh=function(){},p.ki=function(){},p.kj=function(){},p.kk=function(){},p.kl=function(){},p.km=function(){},p.kn=function(){},p.ko=function(){},p.kp=function(){},p.kq=function(){},p.kr=function(){},p.ks=function(){},p.kt=function(){},p.ku=function(){},p.kv=function(){},p.kw=function(){},p.kx=function(){},p.ky=function(){},p.kz=function(){},p.la=function(){},p.lb=function(){},p.lc=function(){},p.ld=function(){},p.le=function(){},p.lf=function(){},p.lg=function(){},p.lh=function(){},p.li=function(){},p.lj=function(){},p.lk=function(){},p.ll=function(){},p.lm=function(){},p.ln=function(){},p.lo=function(){},p.lp=function(){},p.lq=function(){},p.lr=function(){},p.ls=function(){},p.lt=function(){},p.lu=function(){},p.lv=function(){},p.lw=function(){},p.lx=function(){},p.ly=function(){},p.lz=function(){},p.ma=function(){},p.mb=function(){},p.mc=function(){},p.md=function(){},p.me=function(){},p.mf=function(){},p.mg=function(){},p.mh=function(){},p.mi=function(){},p.mj=function(){},p.mk=function(){},p.ml=function(){},p.mm=function(){},p.mn=function(){},p.mo=function(){},p.mp=function(){},p.mq=function(){},p.mr=function(){},p.ms=function(){},p.mt=function(){},p.mu=function(){},p.mv=function(){},p.mw=function(){},p.mx=function(){},p.my=function(){},p.mz=function(){},p.na=function(){},p.nb=function(){},p.nc=function(){},p.nd=function(){},p.ne=function(){},p.nf=function(){},p.ng=function(){},p.nh=function(){},p.ni=function(){},p.nj=function(){},p.nk=function(){},p.nl=function(){},p.nm=function(){},p.nn=function(){},p.no=function(){},p.np=function(){},p.nq=function(){},p.nr=function(){},p.ns=function(){},p.nt=function(){},p.nu=function(){},p.nv=function(){},p.nw=function(){},p.nx=function(){},p.ny=function(){},p.nz=function(){},p.oa=function(){},p.ob=function(){},p.oc=function(){},p.od=function(){},p.oe=function(){},p.of=function(){},p.og=function(){},p.oh=function(){},p.oi=function(){},p.oj=function(){},p.ok=function(){},p.ol=function(){},p.om=function(){},p.on=function(){},p.oo=function(){},p.op=function(){},p.oq=function(){},p.or=function(){},p.os=function(){},p.ot=function(){},p.ou=function(){},p.ov=function(){},p.ow=function(){},p.ox=function(){},p.oy=function(){},p.oz=function(){},p.pa=function(){},p.pb=function(){},p.pc=function(){},p.pd=function(){},p.pe=function(){},p.pf=function(){},p.pg=function(){},p.ph=function(){},p.pi=function(){},p.pj=function(){},p.pk=function(){},p.pl=function(){},p.pm=function(){},p.pn=function(){},p.po=function(){},p.pp=function(){},p.pq=function(){},p.pr=function(){},p.ps=function(){},p.pt=function(){},p.pu=function(){},p.pv=function(){},p.pw=function(){},p.px=function(){},p.py=function(){},p.pz=function(){},p.qa=function(){},p.qb=function(){},p.qc=function(){},p.qd=function(){},p.qe=function(){},p.qf=function(){},p.qg=function(){},p.qh=function(){},p.qi=function(){},p.qj=function(){},p.qk=function(){},p.ql=function(){},p.qm=function(){},p.qn=function(){},p.qo=function(){},p.qp=function(){},p.qq=function(){},p.qr=function(){},p.qs=function(){},p.qt=function(){},p.qu=function(){},p.qv=function(){},p.qw=function(){},p.qx=function(){},p.qy=function(){},p.qz=function(){},p.ra=function(){},p.rb=function(){},p.rc=function(){},p.rd=function(){},p.re=function(){},p.rf=function(){},p.rg=function(){},p.rh=function(){},p.ri=function(){},p.rj=function(){},p.rk=function(){},p.rl=function(){},p.rm=function(){},p.rn=function(){},p.ro=function(){},p.rp=function(){},p.rq=function(){},p.rr=function(){},p.rs=function(){},p.rt=function(){},p.ru=function(){},p.rv=function(){},p.rw=function(){},p.rx=function(){},p.ry=function(){},p.rz=function(){},p.sa=function(){},p.sb=function(){},p.sc=function(){},p.sd=function(){},p.se=function(){},p.sf=function(){},p.sg=function(){},p.sh=function(){},p.si=function(){},p.sj=function(){},p.sk=function(){},p.sl=function(){},p.sm=function(){},p.sn=function(){},p.so=function(){},p.sp=function(){},p.sq=function(){},p.sr=function(){},p.ss=function(){},p.st=function(){},p.su=function(){},p.sv=function(){},p.sw=function(){},p.sx=function(){},p.sy=function(){},p.sz=function(){},p.ta=function(){},p.tb=function(){},p.tc=function(){},p.td=function(){},p.te=function(){},p.tf=function(){},p.tg=function(){},p.th=function(){},p.ti=function(){},p.tj=function(){},p.tk=function(){},p.tl=function(){},p.tm=function(){},p.tn=function(){},p.to=function(){},p.tp=function(){},p.tq=function(){},p.tr=function(){},p.ts=function(){},p.tt=function(){},p.tu=function(){},p.tv=function(){},p.tw=function(){},p.tx=function(){},p.ty=function(){},p.tz=function(){},p.ua=function(){},p.ub=function(){},p.uc=function(){},p.ud=function(){},p.ue=function(){},p.uf=function(){},p.ug=function(){},p.uh=function(){},p.ui=function(){},p.uj=function(){},p.uk=function(){},p.ul=function(){},p.um=function(){},p.un=function(){},p.uo=function(){},p.up=function(){},p.uq=function(){},p.ur=function(){},p.us=function(){},p.ut=function(){},p.uu=function(){},p.uv=function(){},p.uw=function(){},p.ux=function(){},p.uy=function(){},p.uz=function(){},p.va=function(){},p.vb=function(){},p.vc=function(){},p.vd=function(){},p.ve=function(){},p.vf=function(){},p.vg=function(){},p.vh=function(){},p.vi=function(){},p.vj=function(){},p.vk=function(){},p.vl=function(){},p.vm=function(){},p.vn=function(){},p.vo=function(){},p.vp=function(){},p.vq=function(){},p.vr=function(){},p.vs=function(){},p.vt=function(){},p.vu=function(){},p.vv=function(){},p.vw=function(){},p.vx=function(){},p.vy=function(){},p.vz=function(){},p.wa=function(){},p.wb=function(){},p.wc=function(){},p.wd=function(){},p.we=function(){},p.wf=function(){},p.wg=function(){},p.wh=function(){},p.wi=function(){},p.wj=function(){},p.wk=function(){},p.wl=function(){},p.wm=function(){},p.wn=function(){},p.wo=function(){},p.wp=function(){},p.wq=function(){},p.wr=function(){},p.ws=function(){},p.wt=function(){},p.wu=function(){},p.wv=function(){},p.ww=function(){},p.wx=function(){},p.wy=function(){},p.wz=function(){},p.xa=function(){},p.xb=function(){},p.xc=function(){},p.xd=function(){},p.xe=function(){},p.xf=function(){},p.xg=function(){},p.xh=function(){},p.xi=function(){},p.xj=function(){},p.xk=function(){},p.xl=function(){},p.xm=function(){},p.xn=function(){},p.xo=function(){},p.xp=function(){},p.xq=function(){},p.xr=function(){},p.xs=function(){},p.xt=function(){},p.xu=function(){},p.xv=function(){},p.xw=function(){},p.xy=function(){},p.xz=function(){},p.ya=function(){},p.yb=function(){},p.yc=function(){},p.yd=function(){},p.ye=function(){},p.yf=function(){},p.yg=function(){},p.yh=function(){},p.yi=function(){},p.yj=function(){},p.yk=function(){},p.yl=function(){},p.ym=function(){},p.yn=function(){},p.yo=function(){},p.yp=function(){},p.yq=function(){},p.yr=function(){},p.ys=function(){},p.yt=function(){},p.yu=function(){},p.yv=function(){},p.yw=function(){},p.yx=function(){},p.yy=function(){},p.yz=function(){},p.za=function(){},p.zb=function(){},p.zc=function(){},p.zd=function(){},p.ze=function(){},p.zf=function(){},p.zg=function(){},p.zh=function(){},p.zi=function(){},p.zj=function(){},p.zk=function(){},p.zl=function(){},p.zm=function(){},p.zn=function(){},p.zo=function(){},p.zp=function(){},p.zq=function(){},p.zr=function(){},p.zs=function(){},p.zt=function(){},p.zu=function(){},p.zv=function(){},p.zw=function(){},p.zx=function(){},p.zy=function(){},p.zz=function(){}})();
            mixpanel.init('${analyticsConfig.mixpanel.token}', ${analyticsConfig.mixpanel.debug_mode ? '{debug: true}' : '{}'});
          `}
        </Script>
      )}

      {/* Microsoft Clarity */}
      {analyticsConfig.clarity.enabled && analyticsConfig.clarity.project_id && (
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${analyticsConfig.clarity.project_id}");
          `}
        </Script>
      )}

      {/* Meta Pixel (Facebook) */}
      {pixelsConfig.meta.enabled && pixelsConfig.meta.pixel_id && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelsConfig.meta.pixel_id}', ${pixelsConfig.meta.advanced_matching ? '{em: \'{{email}}\', fn: \'{{firstName}}\', ln: \'{{lastName}}\'}, {autoConfig: true}' : '{}'});
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* TikTok Pixel */}
      {pixelsConfig.tiktok.enabled && pixelsConfig.tiktok.pixel_id && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${pixelsConfig.tiktok.pixel_id}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* Pinterest Tag */}
      {pixelsConfig.pinterest.enabled && pixelsConfig.pinterest.tag_id && (
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
            n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pixelsConfig.pinterest.tag_id}', ${pixelsConfig.pinterest.enhanced_match ? '{em: \'{{email}}\'}' : '{}'});
            pintrk('page');
          `}
        </Script>
      )}
    </>
  );
}

export default TrackingScripts;