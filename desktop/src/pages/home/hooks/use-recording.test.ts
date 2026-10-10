// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRecording } from './use-recording'

const mockEmit = vi.fn().mockResolvedValue(undefined)
const mockInvoke = vi.fn().mockResolvedValue([])

vi.mock('@tauri-apps/api/event', () => ({
	emit: (...args: unknown[]) => mockEmit(...args),
}))

vi.mock('@tauri-apps/api/core', () => ({
	invoke: (...args: unknown[]) => mockInvoke(...args),
}))

vi.mock('~/providers/preference', () => ({
	usePreferenceProvider: () => ({ homeTab: 'record' }),
}))

vi.mock('~/lib/config-store', () => ({
	usePersisted: () => [null, vi.fn()],
}))

vi.mock('~/lib/keep-awake', () => ({
	KEEP_AWAKE: { record: 'record' },
	startKeepAwake: vi.fn(),
	stopKeepAwake: vi.fn(),
}))

vi.mock('~/lib/permissions', () => ({
	ensureSystemAudioPermission: vi.fn().mockResolvedValue(true),
}))

describe('useRecording pause and resume', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('initializes with isPaused false', () => {
		const { result } = renderHook(() => useRecording(vi.fn()))
		expect(result.current.isPaused).toBe(false)
		expect(result.current.isRecording).toBe(false)
	})

	it('pauses recording and emits pause_record', async () => {
		const { result } = renderHook(() => useRecording(vi.fn()))

		await act(async () => {
			await result.current.pauseRecord()
		})

		expect(mockEmit).toHaveBeenCalledWith('pause_record')
		expect(result.current.isPaused).toBe(true)
	})

	it('resumes recording and emits resume_record', async () => {
		const { result } = renderHook(() => useRecording(vi.fn()))

		await act(async () => {
			await result.current.pauseRecord()
		})
		expect(result.current.isPaused).toBe(true)

		await act(async () => {
			await result.current.resumeRecord()
		})

		expect(mockEmit).toHaveBeenCalledWith('resume_record')
		expect(result.current.isPaused).toBe(false)
	})

	it('resets isPaused when stopping recording', async () => {
		const { result } = renderHook(() => useRecording(vi.fn()))

		await act(async () => {
			await result.current.pauseRecord()
		})
		expect(result.current.isPaused).toBe(true)

		await act(async () => {
			await result.current.stopRecord()
		})

		expect(mockEmit).toHaveBeenCalledWith('stop_record')
		expect(result.current.isPaused).toBe(false)
	})
})
