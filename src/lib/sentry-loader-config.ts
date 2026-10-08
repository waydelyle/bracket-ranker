/** Ignore only the opaque cross-origin diagnostic observed in production. */
interface DiagnosticEvent {
  exception?: { values?: { value?: string; stacktrace?: { frames?: { filename?: string }[] } }[] };
}

export function isMonitoringDiagnostic(event: DiagnosticEvent): boolean {
  const values = event?.exception?.values;
  if (!values?.length) return false;
  const diagnostic = /^(?:Script error\.?|Event `ErrorEvent` captured as exception with message `Script error\.?`)$/;
  return values.every(value => diagnostic.test(value.value ?? '') &&
    !(value.stacktrace?.frames ?? []).some(frame =>
      /(?:\/_next\/|\.[cm]?js(?:[?#]|$))/.test(frame.filename ?? ''),
    ));
}

// Keep metadata script-safe and define the callback before the CDN loader runs.
export function sentryLoaderConfig(release?: string): string {
  const options = JSON.stringify({
    ...(release ? { release } : {}),
    environment: 'production',
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  }).replace(/</g, '\\u003c');
  return `window.sentryOnLoad=function(){window.Sentry.init({...${options},beforeSend:function(event){return (${isMonitoringDiagnostic.toString()})(event)?null:event;}});};`;
}
