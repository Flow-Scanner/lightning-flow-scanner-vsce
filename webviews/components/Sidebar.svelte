  <script>
    import TailwindWrapper from './commons/TailwindWrapper.svelte';
    import Banner from './Banner.svelte'

    function viewRules() {
      tsvscode.postMessage({
            type: "viewRules"
        });
    }

    function scanFlows() {
      tsvscode.postMessage({
            type: "scanFlows"
        });
    }

    function runTests() {
      tsvscode.postMessage({
            type: "runTests"
        });
    }

    function fixFlows() {
      tsvscode.postMessage({
            type: "fixFlows"
        });
    }

    function configRules() {
      tsvscode.postMessage({
            type: "configRules"
        });
    }

  </script>
  <TailwindWrapper>
    <div class="sb">
    <Banner/>
    <section class="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
      <div class="bg-red-50 border-l-4 border-red-500 p-2 rounded mb-3">
        <p class="text-sm font-bold text-red-700 mb-0">
          Avoid unofficial extensions and disable auto-updates immediately.
        </p>
      </div>
      <p class="ml-5 mb-2 text-sm text-gray-800">
        Extensions run with your privileges, and if compromised, they can steal CLI tokens, GitHub, NPM, and AWS keys, and even exfiltrate or insert code while Code Builder is in use.
      </p>
    </section>
      <nav aria-label="Sidebar">
        <button class="btn btn-blue" on:click={configRules}>
          Configure Rules
        </button>
        <button class="btn btn-blue" on:click={scanFlows}>
          Scan Flows
        </button>
        <button class="btn btn-blue" on:click={runTests}>
          Calc Coverage %
        </button>
        <button class="btn btn-blue" on:click={fixFlows}>
          Fix Flows
        </button>
        <button class="btn btn-blue" on:click={viewRules}>
          Documentation
        </button>
      </nav>
    </div>
  </TailwindWrapper>
  <style>

    .sb{
      @apply flex flex-col;
    }

    p{
      @apply italic mt-auto;
    }

    .btn {
      @apply font-bold py-2 my-2 px-4 rounded;
    }
    .btn-blue {
      @apply bg-blue-500 text-white;
    }
    .btn-blue:hover {
      @apply bg-blue-700;
    }
  </style>