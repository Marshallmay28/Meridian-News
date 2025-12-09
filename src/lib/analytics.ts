// Analytics tracking utilities

interface AnalyticsEvent {
    action: string
    category: string
    label?: string
    value?: number
}

class Analytics {
    private isDevelopment = process.env.NODE_ENV === 'development'

    // Google Analytics
    trackPageView(url: string) {
        if (this.isDevelopment) {
            console.log('📊 Page view:', url)
            return
        }

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
                page_path: url,
            })
        }
    }

    trackEvent({ action, category, label, value }: AnalyticsEvent) {
        if (this.isDevelopment) {
            console.log('📊 Event:', { action, category, label, value })
            return
        }

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value,
            })
        }
    }

    // Common events
    trackArticleView(articleId: string, title: string) {
        this.trackEvent({
            action: 'view_article',
            category: 'Content',
            label: title,
        })
    }

    trackArticleCreate(category: string) {
        this.trackEvent({
            action: 'create_article',
            category: 'Content',
            label: category,
        })
    }

    trackSearch(query: string) {
        this.trackEvent({
            action: 'search',
            category: 'Engagement',
            label: query,
        })
    }

    trackShare(contentType: string, contentId: string) {
        this.trackEvent({
            action: 'share',
            category: 'Social',
            label: `${contentType}:${contentId}`,
        })
    }

    trackLogin(method: string) {
        this.trackEvent({
            action: 'login',
            category: 'Auth',
            label: method,
        })
    }

    trackSignup(method: string) {
        this.trackEvent({
            action: 'signup',
            category: 'Auth',
            label: method,
        })
    }
}

export const analytics = new Analytics()

// To add Google Analytics to your app, add these scripts to layout.tsx <head>:
//
// <Script
//   src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
//   strategy="afterInteractive"
// />
// <Script id="google-analytics" strategy="afterInteractive">
//   {`
//     window.dataLayer = window.dataLayer || [];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js', new Date());
//     gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
//   `}
// </Script>
