import { useState, useEffect } from 'react';
import { Bot, Plus, Settings, Play } from 'lucide-react';
import PageHeader from '@/components/app/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { FormRow } from '@/components/ui/FormRow';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import type * as API from '@/lib/api/types';

export default function Agents() {
  const { currentOrgId } = useAuth();
  const { addToast } = useToast();
  
  const [agents, setAgents] = useState<API.Agent[]>([]);
  const [tools, setTools] = useState<API.Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<API.Agent | null>(null);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [runInput, setRunInput] = useState('');

  const projectId = typeof window !== 'undefined' ? localStorage.getItem('currentProjectId') || undefined : undefined;

  useEffect(() => {
    if (!currentOrgId) return;
    loadData();
  }, [currentOrgId, projectId]);

  const loadData = async () => {
    if (!currentOrgId) return;
    
    try {
      setIsLoading(true);
      const [agentsResponse, toolsResponse] = await Promise.all([
        api.listAgents({ orgId: currentOrgId, projectId }),
        api.listTools(currentOrgId),
      ]);
      setAgents(agentsResponse.data);
      setTools(toolsResponse.data);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
      addToast(err.message || 'Failed to load agents', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOrgId) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const model = formData.get('model') as string;
    const systemPrompt = formData.get('systemPrompt') as string;
    const temperature = parseFloat(formData.get('temperature') as string);
    const toolPolicy = formData.get('toolPolicy') as API.ToolPolicy;
    const maxSteps = parseInt(formData.get('maxSteps') as string);

    try {
      const agent = await api.createAgent(currentOrgId, {
        projectId,
        name,
        model,
        systemPrompt,
        temperature,
        toolPolicy,
        maxSteps,
        toolIds: selectedToolIds,
      });
      setAgents(prev => [agent, ...prev]);
      setIsNewAgentModalOpen(false);
      setSelectedToolIds([]);
      addToast('Agent created successfully', 'success');
    } catch (err: any) {
      console.error('Failed to create agent:', err);
      addToast(err.message || 'Failed to create agent', 'error');
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAgent) return;

    const formData = new FormData(e.currentTarget);
    const systemPrompt = formData.get('systemPrompt') as string;
    const temperature = parseFloat(formData.get('temperature') as string);
    const toolPolicy = formData.get('toolPolicy') as API.ToolPolicy;
    const maxSteps = parseInt(formData.get('maxSteps') as string);
    const isActive = formData.get('isActive') === 'true';

    try {
      const updated = await api.updateAgent(selectedAgent.id, {
        systemPrompt,
        temperature,
        toolPolicy,
        maxSteps,
        isActive,
        toolIds: selectedToolIds,
      });
      setAgents(prev => prev.map(a => a.id === selectedAgent.id ? updated : a));
      setIsEditModalOpen(false);
      setSelectedAgent(null);
      setSelectedToolIds([]);
      addToast('Agent updated successfully', 'success');
    } catch (err: any) {
      console.error('Failed to update agent:', err);
      addToast(err.message || 'Failed to update agent', 'error');
    }
  };

  const handleRunAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAgent) return;

    try {
      const run = await api.startAgentRun(selectedAgent.id, runInput, projectId);
      setIsRunModalOpen(false);
      setSelectedAgent(null);
      setRunInput('');
      addToast(`Agent run started: ${run.id}`, 'success');
      
      // Navigate to runs page
      window.location.href = '/runs';
    } catch (err: any) {
      console.error('Failed to start agent run:', err);
      addToast(err.message || 'Failed to start agent run', 'error');
    }
  };

  const openEditModal = async (agent: API.Agent) => {
    try {
      const fullAgent = await api.getAgent(agent.id);
      setSelectedAgent(fullAgent);
      setSelectedToolIds(fullAgent.tools?.map(t => t.id) || []);
      setIsEditModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load agent:', err);
      addToast(err.message || 'Failed to load agent', 'error');
    }
  };

  const openRunModal = (agent: API.Agent) => {
    setSelectedAgent(agent);
    setIsRunModalOpen(true);
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.systemPrompt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumn<API.Agent>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (agent) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-neutral-900">{agent.name}</div>
            <div className="text-sm text-neutral-500">{agent.toolPolicy} policy • {agent.maxSteps} max steps</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'model',
      header: 'Model',
      accessor: (agent) => <span className="text-sm text-neutral-700">{agent.model}</span>,
      sortable: true,
    },
    {
      key: 'tools',
      header: 'Tools',
      accessor: (agent) => <span className="text-sm text-neutral-700">{agent.toolCount || 0} tools</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (agent) => (
        <Badge className={agent.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}>
          {agent.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastRun',
      header: 'Last Run',
      accessor: (agent) => (
        <span className="text-sm text-neutral-600">
          {agent.lastRun ? new Date(agent.lastRun).toLocaleDateString() : 'Never'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (agent) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => openRunModal(agent)}>
            <Play size={16} />
            Run
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(agent)}>
            <Settings size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="AI Agents"
        description="Autonomous assistants for construction workflows"
        actions={
          <Button onClick={() => setIsNewAgentModalOpen(true)}>
            <Plus size={20} />
            New Agent
          </Button>
        }
      />

      <div className="p-6">
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredAgents}
          getRowId={(agent) => agent.id}
          pagination
          pageSize={20}
        />
      </div>

      {/* New Agent Modal */}
      <Modal
        isOpen={isNewAgentModalOpen}
        onClose={() => {
          setIsNewAgentModalOpen(false);
          setSelectedToolIds([]);
        }}
        title="Create New Agent"
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <FormRow label="Name" htmlFor="name" required>
            <Input id="name" name="name" type="text" placeholder="Construction Assistant" required />
          </FormRow>

          <FormRow label="Model" htmlFor="model" required>
            <Select id="model" name="model" required>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </Select>
          </FormRow>

          <FormRow label="System Prompt" htmlFor="systemPrompt">
            <Textarea
              id="systemPrompt"
              name="systemPrompt"
              rows={4}
              placeholder="You are a helpful construction assistant..."
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Temperature" htmlFor="temperature">
              <Input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue="0.2"
              />
            </FormRow>

            <FormRow label="Max Steps" htmlFor="maxSteps">
              <Input
                id="maxSteps"
                name="maxSteps"
                type="number"
                min="1"
                max="32"
                defaultValue="16"
              />
            </FormRow>
          </div>

          <FormRow label="Tool Policy" htmlFor="toolPolicy">
            <Select id="toolPolicy" name="toolPolicy">
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </Select>
          </FormRow>

          <FormRow label="Tools">
            <div className="space-y-2">
              {tools.map(tool => (
                <label key={tool.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedToolIds.includes(tool.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedToolIds([...selectedToolIds, tool.id]);
                      } else {
                        setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                      }
                    }}
                  />
                  <span className="text-sm">{tool.name} - {tool.description}</span>
                </label>
              ))}
            </div>
          </FormRow>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsNewAgentModalOpen(false);
                setSelectedToolIds([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Agent Modal */}
      {selectedAgent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAgent(null);
            setSelectedToolIds([]);
          }}
          title={`Edit Agent: ${selectedAgent.name}`}
        >
          <form onSubmit={handleUpdateAgent} className="space-y-4">
            <FormRow label="System Prompt" htmlFor="systemPrompt">
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                rows={4}
                defaultValue={selectedAgent.systemPrompt}
              />
            </FormRow>

            <div className="grid grid-cols-2 gap-4">
              <FormRow label="Temperature" htmlFor="temperature">
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue={selectedAgent.temperature}
                />
              </FormRow>

              <FormRow label="Max Steps" htmlFor="maxSteps">
                <Input
                  id="maxSteps"
                  name="maxSteps"
                  type="number"
                  min="1"
                  max="32"
                  defaultValue={selectedAgent.maxSteps}
                />
              </FormRow>
            </div>

            <FormRow label="Tool Policy" htmlFor="toolPolicy">
              <Select id="toolPolicy" name="toolPolicy" defaultValue={selectedAgent.toolPolicy}>
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </Select>
            </FormRow>

            <FormRow label="Status" htmlFor="isActive">
              <Select id="isActive" name="isActive" defaultValue={selectedAgent.isActive.toString()}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormRow>

            <FormRow label="Tools">
              <div className="space-y-2">
                {tools.map(tool => (
                  <label key={tool.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedToolIds.includes(tool.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedToolIds([...selectedToolIds, tool.id]);
                        } else {
                          setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                        }
                      }}
                    />
                    <span className="text-sm">{tool.name} - {tool.description}</span>
                  </label>
                ))}
              </div>
            </FormRow>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedAgent(null);
                  setSelectedToolIds([]);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Agent
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Run Agent Modal */}
      {selectedAgent && (
        <Modal
          isOpen={isRunModalOpen}
          onClose={() => {
            setIsRunModalOpen(false);
            setSelectedAgent(null);
            setRunInput('');
          }}
          title={`Run Agent: ${selectedAgent.name}`}
        >
          <form onSubmit={handleRunAgent} className="space-y-4">
            <FormRow label="Input" htmlFor="input" required>
              <Textarea
                id="input"
                name="input"
                rows={6}
                placeholder="Enter your question or task for the agent..."
                value={runInput}
                onChange={(e) => setRunInput(e.target.value)}
                required
              />
            </FormRow>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsRunModalOpen(false);
                  setSelectedAgent(null);
                  setRunInput('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                <Play size={16} />
                Run Agent
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
