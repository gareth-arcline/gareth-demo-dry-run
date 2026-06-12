export const initialState = {
  currentStep: 1,
  files: [],
  prompt: '',
  outline: [],
  finalContent: null,
  isProcessing: false,
  error: null,
}

export function wizardReducer(state, action) {
  switch (action.type) {
    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.payload] }

    case 'UPDATE_FILE_PROGRESS': {
      const update = { progress: action.payload.progress, status: action.payload.status, message: action.payload.message }
      if (action.payload.serverId !== undefined) update.serverId = action.payload.serverId
      return {
        ...state,
        files: state.files.map(f =>
          f.id === action.payload.id ? { ...f, ...update } : f
        ),
      }
    }

    case 'REMOVE_FILE':
      return { ...state, files: state.files.filter(f => f.id !== action.payload) }

    case 'SET_PROMPT':
      return { ...state, prompt: action.payload }

    case 'SET_OUTLINE':
      return { ...state, outline: action.payload }

    case 'REORDER_TOPICS': {
      return { ...state, outline: action.payload }
    }

    case 'DELETE_TOPIC':
      return { ...state, outline: state.outline.filter(t => t.id !== action.payload) }

    case 'COMBINE_TOPICS': {
      const { sourceId, targetId } = action.payload
      const source = state.outline.find(t => t.id === sourceId)
      const target = state.outline.find(t => t.id === targetId)
      if (!source || !target) return state

      const combined = {
        ...target,
        title: `${target.title} / ${source.title}`,
        subTopics: [...target.subTopics, ...source.subTopics],
      }
      return {
        ...state,
        outline: state.outline
          .map(t => (t.id === targetId ? combined : t))
          .filter(t => t.id !== sourceId),
      }
    }

    case 'ADD_TOPIC':
      return { ...state, outline: [...state.outline, action.payload] }

    case 'UPDATE_TOPIC':
      return {
        ...state,
        outline: state.outline.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      }

    case 'SET_FINAL_CONTENT':
      return { ...state, finalContent: action.payload }

    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}
