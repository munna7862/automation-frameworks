# ==============================================================================
# BuggyBooks AutomationFrameworks — Dev Container Dockerfile
#
# Provides a fully hermetic, batteries-included engineering container:
#   - Node.js 24 LTS
#   - Google Chrome Stable (single-browser policy per AGENTS.md §1)
#   - Apache JMeter 5.6.3 (/opt/jmeter)
#   - Grafana k6 (official repo)
#   - Allure CLI 2.34.1 (/opt/allure)
#   - go-task (Taskfile runner)
# ==============================================================================

FROM mcr.microsoft.com/devcontainers/typescript-node:24

# Set non-interactive debian frontend during build
ENV DEBIAN_FRONTEND=noninteractive

# Pinned tool versions matching CI and repository baselines
ARG CHROME_DEB_URL=https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ARG JMETER_VERSION=5.6.3
ARG ALLURE_VERSION=2.34.1
ARG TASK_VERSION=3.42.1

USER root

# 1. Install prerequisites, system libraries, and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    unzip \
    wget \
    procps \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Google Chrome Stable (strictly enforced single-browser policy)
RUN install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 3. Install Apache JMeter 5.6.3 into /opt/jmeter
RUN mkdir -p /opt/jmeter \
    && curl -fsSL "https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz" -o /tmp/jmeter.tgz \
    && tar -xzf /tmp/jmeter.tgz -C /opt/jmeter --strip-components=1 \
    && chmod -R 755 /opt/jmeter \
    && rm -f /tmp/jmeter.tgz

# 4. Install Grafana k6 via official apt repository
RUN curl -fsSL https://dl.k6.io/key.gpg | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends k6 \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Allure CLI into /opt/allure
RUN mkdir -p /opt/allure \
    && curl -fsSL "https://github.com/allure-framework/allure2/releases/download/${ALLURE_VERSION}/allure-${ALLURE_VERSION}.tgz" -o /tmp/allure.tgz \
    && tar -xzf /tmp/allure.tgz -C /opt/allure --strip-components=1 \
    && chmod -R 755 /opt/allure \
    && rm -f /tmp/allure.tgz

# 6. Install go-task (task binary)
RUN curl -fsSL "https://github.com/go-task/task/releases/download/v${TASK_VERSION}/task_linux_amd64.tar.gz" -o /tmp/task.tar.gz \
    && tar -xzf /tmp/task.tar.gz -C /usr/local/bin task \
    && chmod +x /usr/local/bin/task \
    && rm -f /tmp/task.tar.gz

# 7. Configure PATH for all users
ENV PATH="/opt/jmeter/bin:/opt/allure/bin:${PATH}"

# Reset debian frontend
ENV DEBIAN_FRONTEND=dialog

USER node
