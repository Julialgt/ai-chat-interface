import { useState } from 'react';
import Drawer from './Drawer';

export default function AboutDrawer({ open, onClose, returnFocusRef }) {
  const [activePanel, setActivePanel] = useState(1);

  const panelTitle =
    activePanel === 1
      ? 'About This Project'
      : activePanel === 2
        ? 'Engineering Decisions'
        : 'Scalability & Production Considerations';

  return (
    <Drawer open={open} title={panelTitle} onClose={onClose} returnFocusRef={returnFocusRef}>
      <div className="about-tabs" role="tablist" aria-label="About panels">
        <button
          type="button"
          className={`about-tab ${activePanel === 1 ? 'active' : ''}`}
          role="tab"
          aria-selected={activePanel === 1}
          aria-label="About this project"
          onClick={() => setActivePanel(1)}
        />
        <button
          type="button"
          className={`about-tab ${activePanel === 2 ? 'active' : ''}`}
          role="tab"
          aria-selected={activePanel === 2}
          aria-label="Engineering decisions"
          onClick={() => setActivePanel(2)}
        />
        <button
          type="button"
          className={`about-tab ${activePanel === 3 ? 'active' : ''}`}
          role="tab"
          aria-selected={activePanel === 3}
          aria-label="Scalability and production considerations"
          onClick={() => setActivePanel(3)}
        />
      </div>

      {activePanel === 1 && (
        <>
          <section className="about-section">
            <h3 className="about-section-title">Tech Stack</h3>
            <ul className="about-list">
              <li>React (Vite)</li>
              <li>Context API</li>
              <li>Custom Hooks</li>
              <li>Streaming UI Simulation</li>
              <li>Slash Command System</li>
            </ul>
          </section>

          <section className="about-section">
            <h3 className="about-section-title">Architecture Highlights</h3>
            <ul className="about-list">
              <li>Modular component structure</li>
              <li>Streaming text hook</li>
              <li>Auto-scroll hook</li>
              <li>Drawer system</li>
              <li>Context-driven state management</li>
            </ul>
          </section>

          <section className="about-section">
            <h3 className="about-section-title">Features</h3>
            <ul className="about-list">
              <li>Fake streaming assistant</li>
              <li>Slash commands</li>
              <li>Right-side panels</li>
              <li>Scroll-to-bottom logic</li>
              <li>Message actions</li>
            </ul>
          </section>
        </>
      )}

      {activePanel === 2 && (
        <section className="about-section">
          <h3 className="about-section-title">Engineering Decisions</h3>
          <ul className="about-list">
            <li>Component-first layout (sidebar, header, chat, composer) for clear separation of concerns.</li>
            <li>Custom hooks for streaming text and auto-scroll, keeping interaction logic close to the UI.</li>
            <li>Design tokens and CSS variables for consistent light/dark theming and spacing.</li>
            <li>React Context for shared app state (theme, active chat) with local state kept inside components.</li>
            <li>Streaming UI is fully simulated on the frontend to focus on UX and interaction design, not backend logic.</li>
            <li>Accessibility-minded choices: semantic HTML, keyboard-friendly drawers/modals, and visible focus states.</li>
          </ul>
        </section>
      )}

      {activePanel === 3 && (
        <section className="about-section">
          <h3 className="about-section-title">Scalability &amp; Production Considerations</h3>
          <ul className="about-list">
            <li>Chat content lives in a dedicated scrollable area to handle long conversation histories.</li>
            <li>Message list structure is compatible with virtualization/windowing if performance becomes an issue.</li>
            <li>Styling is split into design tokens and app-level CSS to keep theming and maintenance manageable.</li>
            <li>Responsive layout using flexbox and media queries so the UI stays usable on smaller screens.</li>
            <li>UI covers key states (empty, streaming, disabled actions, “coming soon” panels) to avoid confusing edge cases.</li>
            <li>Frontend is integration-ready: a real API client can be wired into the existing send/stream handlers without changing the UI structure.</li>
          </ul>
        </section>
      )}

      <div className="about-footer">
        <button type="button" className="about-github-btn" disabled>
          GitHub (placeholder)
        </button>
      </div>
    </Drawer>
  );
}
