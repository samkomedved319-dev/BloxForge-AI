"use client";

import { ArrowLeft, Shield, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LegalPage({ type }: { type: "privacy" | "tos" }) {
  const isPrivacy = type === "privacy";
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";
  const lastUpdated = "July 2025";

  return (
    <main className="flex-1">
      <div className="bg-radial-brand pointer-events-none absolute inset-x-0 top-0 h-48 opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <button
          onClick={() => (window.location.hash = "")}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
            {isPrivacy ? <Shield className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <Card className="mt-8 border-border/60 bg-card p-8">
          {isPrivacy ? <PrivacyContent /> : <TosContent />}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Questions about this {title.toLowerCase()}? Contact{" "}
          <a
            href="mailto:support@bloxforge.ai"
            className="text-violet-400 hover:underline"
          >
            support@bloxforge.ai
          </a>
        </p>
      </div>
    </main>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Overview">
        BloxForge AI ("we", "us", "our") operates a web application and Roblox
        Studio plugin that provides AI-powered Luau code generation and
        developer tools. This Privacy Policy explains what data we collect, how
        we use it, and your rights. By using BloxForge AI, you agree to the
        practices described here.
      </Section>

      <Section title="2. Roblox account data">
        BloxForge AI uses Roblox OAuth2 to authenticate users. When you sign in:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>We request the <b>openid</b> and <b>profile</b> scopes.</li>
          <li>We receive your <b>Roblox user ID</b> and <b>username</b> (display name).</li>
          <li>We <b>never</b> receive or store your Roblox password.</li>
          <li>You can revoke BloxForge's access at any time from your Roblox account settings.</li>
        </ul>
      </Section>

      <Section title="3. Conversations & generated code">
        When you chat with the AI, your messages and the AI's responses are
        stored in our database so you can revisit saved sessions. You can delete
        any conversation at any time from your dashboard or settings. Deleted
        data is permanently removed.
      </Section>

      <Section title="4. Studio connector (plugin)">
        The optional Roblox Studio plugin connects your Studio session to the
        web app. It sends:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>The name and source of the script you currently have selected (only when connected).</li>
          <li>Heartbeat pings every 3 seconds to keep the connection alive.</li>
        </ul>
        No other Studio data is transmitted. The plugin only runs while you
        have it open and connected.
      </Section>

      <Section title="5. Usage data">
        We track the number of AI messages you send per day to enforce plan
        limits. We do not track keystrokes, mouse movements, or browsing
        behavior. We log server errors for debugging (without message content).
      </Section>

      <Section title="6. Cookies & authentication">
        We use an HTTP-only session cookie to keep you signed in. No tracking
        cookies, advertising cookies, or third-party analytics are used.
      </Section>

      <Section title="7. AI provider (NVIDIA NIM)">
        AI requests are sent to NVIDIA NIM (or a custom provider configured by
        an admin) for processing. Your message content is transmitted to the
        AI provider to generate a response. NVIDIA's privacy policy applies to
        data they process.
      </Section>

      <Section title="8. Data retention">
        <ul className="list-disc space-y-1 pl-5">
          <li>Account data: retained until you delete your account.</li>
          <li>Conversations: retained until you delete them or your account.</li>
          <li>Studio context: ephemeral — only held in memory while connected.</li>
        </ul>
      </Section>

      <Section title="9. Your rights">
        You can: view your data (dashboard), export it (by copying
        conversations), delete individual conversations, or permanently delete
        your entire account from Settings → Danger Zone.
      </Section>

      <Section title="10. Children's privacy">
        Roblox users under 13 should have parental consent to use Roblox. We do
        not knowingly collect data from anyone unable to use Roblox. If you
        believe a minor's data was collected, contact us to delete it.
      </Section>

      <Section title="11. Changes to this policy">
        We may update this policy. We'll update the "Last updated" date above.
        Significant changes will be announced in the app.
      </Section>
    </div>
  );
}

function TosContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <Section title="1. Acceptance of terms">
        By accessing or using BloxForge AI, you agree to be bound by these
        Terms of Service. If you do not agree, do not use the service.
      </Section>

      <Section title="2. Description of service">
        BloxForge AI is an AI-powered coding companion for Roblox/Luau
        developers. It includes a web chat interface, saved conversations, a
        Roblox Studio connector plugin, and administrative tools. The service
        is currently in beta.
      </Section>

      <Section title="3. Beta access">
        During the beta period:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Access requires admin approval after sign-in.</li>
          <li>The service may be modified, interrupted, or discontinued at any time.</li>
          <li>Free accounts have daily message limits (configurable by admins).</li>
          <li>We may revoke access for any reason.</li>
        </ul>
      </Section>

      <Section title="4. Your account">
        <ul className="list-disc space-y-1 pl-5">
          <li>You must sign in with your own Roblox account.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>You must not share access or attempt to bypass rate limits.</li>
          <li>Admins may grant, revoke, or modify your plan and credits at their discretion.</li>
        </ul>
      </Section>

      <Section title="5. Acceptable use">
        You agree not to:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use the service to generate malicious or harmful code.</li>
          <li>Attempt to access other users' data or admin systems.</li>
          <li>Abuse, overload, or reverse-engineer the service.</li>
          <li>Use the service to violate Roblox's Terms of Service.</li>
        </ul>
      </Section>

      <Section title="6. Generated content">
        AI-generated code is provided "as is" without warranty. You are
        responsible for reviewing and testing all generated code before
        shipping it. BloxForge AI is not liable for bugs, data loss, or other
        issues caused by AI-generated content.
      </Section>

      <Section title="7. Roblox Studio plugin">
        The plugin is optional. It creates instances (Scripts, Parts, Models)
        in your Studio project at your request. You are responsible for any
        content created by the plugin. The plugin does not modify existing
        instances without your explicit action.
      </Section>

      <Section title="8. Intellectual property">
        You retain ownership of your conversations and generated code. BloxForge
        AI retains ownership of the service, including the web app, plugin
        source, and AI system prompts.
      </Section>

      <Section title="9. Disclaimer">
        The service is provided "as is" and "as available" without warranties
        of any kind. We do not guarantee uninterrupted or error-free service.
      </Section>

      <Section title="10. Limitation of liability">
        BloxForge AI is not liable for any indirect, incidental, or
        consequential damages arising from use of the service. Total liability
        is limited to the amount you paid for the service in the past 12 months
        (zero for free accounts).
      </Section>

      <Section title="11. Termination">
        You can delete your account at any time from Settings. We may suspend
        or terminate access for violations of these terms.
      </Section>

      <Section title="12. Changes to terms">
        We may update these terms. Continued use after changes constitutes
        acceptance. Material changes will be announced.
      </Section>

      <Section title="13. Contact">
        Questions? Email{" "}
        <a href="mailto:support@bloxforge.ai" className="text-violet-400 hover:underline">
          support@bloxforge.ai
        </a>
        .
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 font-display text-base font-bold text-foreground">
        {title}
      </h2>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
