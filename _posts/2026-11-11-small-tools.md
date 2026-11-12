---
title: Small tools
draft: true
---

A good starting point for a small tool is a task you can describe in one sentence. “Run this script whenever this note changes” is one of the jobs [Obsidian Actions](https://github.com/mcmanussliam/obsidian-actions) can do.

Once the script runs at the right moment, you can take a step out of the workflow and have one less button to remember.

<hr>
<section aria-labelledby="formatting">
  <h2 id="formatting">Formatting examples</h2>
  <h3>Heading level 3</h3>
  <h4>Heading level 4</h4>
  <h5>Heading level 5</h5>
  <h6>Heading level 6</h6>

  <h3>Inline text</h3>
  <p>Regular text, <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <s>struck through</s>, <mark>highlighted</mark>, and <small>small print</small>.</p>
  <p>Inline code <code>console.log()</code>, keyboard input <kbd>Ctrl</kbd> + <kbd>K</kbd>, subscript H<sub>2</sub>O, superscript x<sup>2</sup>, and <a href="#code-example">a link to the code example</a>.</p>

  <h3>Quotation</h3>
  <blockquote>
    <p>A small tool is useful when it saves a step you would otherwise repeat.</p>
  </blockquote>

  <h3>Lists</h3>
  <ul>
    <li>JavaScript actions</li>
    <li>Shell commands</li>
  </ul>
  <ol>
    <li>Choose an event.</li>
    <li>Write the script.</li>
    <li>Test it on a note.</li>
  </ol>
  <dl>
    <dt>Trigger</dt>
    <dd>The event that starts an action.</dd>
    <dt>Action</dt>
    <dd>The code that runs when the event happens.</dd>
  </dl>

  <h3 id="code-example">Code block</h3>
  <pre><code>const note = "Small tools";
console.log("Updated " + note);</code></pre>

  <h3 id="trigger-examples">Table</h3>
  <table aria-labelledby="trigger-examples">
    <thead>
      <tr><th scope="col">Event</th><th scope="col">Action</th></tr>
    </thead>
    <tbody>
      <tr><td>Note changes</td><td>Run a script</td></tr>
      <tr><td>App starts</td><td>Show a notice</td></tr>
    </tbody>
  </table>

  <h3 id="image-example">Image with a caption</h3>
  <figure>
    <img src="{{ '/assets/obsidian-actions.webp' | relative_url }}" alt="Obsidian Actions settings showing four actions with enable switches." width="1100" height="479" loading="lazy">
    <figcaption>The Obsidian Actions settings panel, with examples for formatting Markdown and backing up a vault.</figcaption>
  </figure>

  <h3>Expandable text</h3>
  <details>
    <summary>Show an example</summary>
    <p>This paragraph appears when the disclosure is open.</p>
  </details>
</section>
