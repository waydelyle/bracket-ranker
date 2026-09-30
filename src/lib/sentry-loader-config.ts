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

// Define this synchronously before the loader can initialise its SDK.
export const SENTRY_LOADER_CONFIG = `window.sentryOnLoad=function(){window.Sentry.init({beforeSend:function(event){return (${isMonitoringDiagnostic.toString()})(event)?null:event;}});};`;
