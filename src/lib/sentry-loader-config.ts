// Literal ES5 callback: the original head configuration runs before the deferred loader.
export function sentryLoaderConfig(release?: string): string {
  const metadata = JSON.stringify({
    ...(release ? { release } : {}),
    environment: 'production',
    sendDefaultPii: false,
    enableLogs: false,
    maxBreadcrumbs: 0,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    ignoreErrors: [],
    denyUrls: [],
  }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

  return String.raw`window.sentryOnLoad=function bracketRankerSentryOnLoad(){
var options=${metadata};
function cleanUrl(value){
  if(typeof value!=="string")return value;
  var prefix=/^blob:/i.test(value)?value.slice(0,5):"";
  var url=prefix?value.slice(5):value;
  return prefix+url.split(/[?#]/)[0].replace(/^((?:[a-z][a-z0-9+.-]*:)?\/\/)[^\/]*@/i,"$1");
}
function cleanFrames(stack){
  if(!stack||!Array.isArray(stack.frames))return;
  stack.frames.forEach(function(frame){
    if(!frame||typeof frame!=="object")return;
    ["filename","abs_path","absPath","fileName"].forEach(function(key){
      if(typeof frame[key]==="string")frame[key]=cleanUrl(frame[key]);
    });
    delete frame.vars;
  });
}
function cleanStacks(value){
  if(!value||typeof value!=="object")return;
  cleanFrames(value.stacktrace);cleanFrames(value.rawStacktrace);cleanFrames(value.raw_stacktrace);
}
options.beforeSend=function preserveBracketRankerEvent(event){
  delete event.user;delete event.extra;delete event.breadcrumbs;
  if(event.request){
    if(typeof event.request.url==="string")event.request.url=cleanUrl(event.request.url);
    delete event.request.data;delete event.request.body;delete event.request.cookies;
    delete event.request.headers;delete event.request.query_string;
  }
  if(event.tags)Object.keys(event.tags).forEach(function(key){
    var value=event.tags[key];
    if(typeof value==="string"&&(key==="url"||/^(?:(?:blob:)?[a-z][a-z0-9+.-]*:\/\/|\/)/i.test(value)))
      event.tags[key]=cleanUrl(value);
  });
  if(typeof event.transaction==="string")event.transaction=cleanUrl(event.transaction);
  if(event.contexts){
    if(event.contexts.trace)delete event.contexts.trace.data;
    if(event.contexts.nextjs&&typeof event.contexts.nextjs.request_path==="string")
      event.contexts.nextjs.request_path=cleanUrl(event.contexts.nextjs.request_path);
  }
  cleanStacks(event);
  if(event.exception&&Array.isArray(event.exception.values))event.exception.values.forEach(cleanStacks);
  return event;
};
options.tracesSampler=function bracketRankerZeroSampler(){return 0;};
options.integrations=function bracketRankerIntegrations(defaults){
  return defaults.filter(function(integration){
    return integration.name!=="Replay"&&integration.name!=="BrowserTracing";
  }).map(function(integration){
    if(integration.name!=="InboundFilters"&&integration.name!=="EventFilters")return integration;
    var factory=integration.name==="EventFilters"?window.Sentry.eventFiltersIntegration:window.Sentry.inboundFiltersIntegration;
    factory=factory||window.Sentry.eventFiltersIntegration||window.Sentry.inboundFiltersIntegration;
    return typeof factory==="function"?factory({disableErrorDefaults:true}):integration;
  });
};
// BrowserSession stays installed; only session envelope transmission is disabled.
options.transport=function bracketRankerTransport(transportOptions){
  var delegate=window.Sentry.makeFetchTransport(transportOptions);
  return {
    send:function bracketRankerSend(envelope){
      var items=envelope[1].filter(function(item){return item[0].type!=="session"&&item[0].type!=="sessions";});
      if(items.length===envelope[1].length)return delegate.send(envelope);
      if(!items.length)return Promise.resolve({});
      return delegate.send([envelope[0],items]);
    },
    flush:function bracketRankerFlush(timeout){return delegate.flush(timeout);}
  };
};
window.Sentry.init(options);
};`;
}
