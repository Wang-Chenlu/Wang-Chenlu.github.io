function getStatcounterConfig() {
  const enabled = process.env.NEXT_PUBLIC_STATCOUNTER_ENABLED;
  const projectId = process.env.NEXT_PUBLIC_STATCOUNTER_PROJECT_ID?.trim();
  const securityCode = process.env.NEXT_PUBLIC_STATCOUNTER_SECURITY_CODE?.trim();

  if (enabled === 'false' || !projectId || !securityCode) {
    return null;
  }

  if (!/^\d+$/.test(projectId) || !/^[a-z0-9]+$/i.test(securityCode)) {
    return null;
  }

  return { projectId, securityCode };
}

export function StatcounterScripts() {
  const config = getStatcounterConfig();

  if (!config) {
    return null;
  }

  const { projectId, securityCode } = config;

  return (
    <>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            var sc_project=${projectId};
            var sc_invisible=1;
            var sc_security=${JSON.stringify(securityCode)};
            var sc_remove_link=1;
          `,
        }}
      />
      <script
        type="text/javascript"
        src="https://www.statcounter.com/counter/counter.js"
        defer
      />
    </>
  );
}

export function StatcounterNoscript() {
  const config = getStatcounterConfig();

  if (!config) {
    return null;
  }

  const { projectId, securityCode } = config;

  return (
      <noscript>
        <div className="sr-only">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://c.statcounter.com/${projectId}/0/${securityCode}/1/`}
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </noscript>
  );
}

export default function StatcounterAnalytics() {
  return (
    <>
      <StatcounterScripts />
      <StatcounterNoscript />
    </>
  );
}
