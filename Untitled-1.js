<!DOCTYPE html>
<head>
    <title>Hobby Konfigurator</title>
    <base href="https://konfigurator.hobby-caravan.de/konfigurator/"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">
    <link rel="mask-icon" href="safari-pinned-tab.svg" color="#3f89bf">
    <meta name="apple-mobile-web-app-title" content="Hobby Konfigurator">
    <meta name="application-name" content="Hobby Konfigurator">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="theme-color" content="#ffffff">
    <script>
        !function(f, b, e, v, n, t, s) {
            if (f.fbq)
                return;
            n = f.fbq = function() {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            }
            ;
            if (!f._fbq)
                f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1889312391402390');
        fbq('track', 'PageView');
        fbq('track', 'ViewContent');
    </script>
    <script type="text/javascript">
        window.hobbyVehicleConfigurator = {
            baseUrlPathSegment: 'konfigurator/',
            environment: 'production',
            etrackerSecureCode: 'UKbv3b',
            preloadedResources: {
                apiLinks: '{"_links":{"self":{"href":"deu_DEU\/api\/v1"},"catalog":{"href":"deu_DEU\/api\/v1\/catalog"},"catalogs":{"href":"deu_DEU\/api\/v1\/catalogs"},"companyData":{"href":"deu_DEU\/api\/v1\/company_data"},"configuration":{"href":"deu_DEU\/api\/v1\/configuration"},"image":{"href":"deu_DEU\/api\/v1\/image"},"install":{"href":"deu_DEU\/api\/v1\/install"},"language":{"href":"deu_DEU\/api\/v1\/language"},"model":{"href":"deu_DEU\/api\/v1\/model"}}}',
            },
        };
        function fetch(url, callback) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        callback(xhr.responseText)
                    }
                }
                ;
                xhr.open('GET', url, true);
                xhr.send();
            } catch (error) {
                console.warn(error);
            }
            return xhr;
        }
        ;window.hobbyVehicleConfigurator.preloadedResources.language = fetch('deu_DEU/api/v1/language', function(json) {
            window.hobbyVehicleConfigurator.preloadedResources.language = json;
        });
        window.hobbyVehicleConfigurator.preloadedResources.catalog = fetch('deu_DEU/api/v1/catalog', function(json) {
            window.hobbyVehicleConfigurator.preloadedResources.catalog = json;
        });
        function injectStyleSheet(url) {
            var el = document.createElement('link');
            el.setAttribute('rel', 'stylesheet');
            el.setAttribute('href', url);
            document.getElementsByTagName('head')[0].appendChild(el);
        }
        ;injectStyleSheet('public/css/style.css?v=2693a49da472d5c3e82a45b916680323');
        injectStyleSheet('https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic');
    </script>
    <script async src="public/javascript/configurator.js?v=a269e3c7fb6feb64e6e7650b39beab60"></script>
    <noscript>
        <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1889312391402390&ev=PageView&noscript=1"/>
    </noscript>
</head>
<body class="">
    <div id="root">
        <div style="position:absolute;top:0;right:0;bottom:0;left:0;background:#3f89bf">
            <div class="loading-spinner is-centered-vertically color-white is-visible"></div>
        </div>
    </div>
</body>
