import { useState, useMemo } from "react";
import { DateSlotPicker, StatCard } from "./ui";
import { fmtDate, C, S } from "../lib/constants";

export default function WhatsAppMsg({ duties = [] }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("I");
  const [selected, setSelected] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Native share progress state
  const [nativeShareMsg, setNativeShareMsg] = useState("");
  const [shareIndex, setShareIndex] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const dayDuties = useMemo(() => {
    if (!date) return [];
    return duties.filter((d) => d.date === date && d.slot === slot);
  }, [duties, date, slot]);

  const stats = useMemo(() => {
    const total = dayDuties.length;
    const withMobile = dayDuties.filter((d) => d.mobile).length;
    const selectedCount = selected.size;
    return { total, withMobile, selectedCount };
  }, [dayDuties, selected]);

  const selectedWithMobile = useMemo(() => {
    return dayDuties.filter((d) => selected.has(d.id) && d.mobile);
  }, [dayDuties, selected]);

  const toggleSelect = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  const selectAll = () => {
    const allIds = new Set(dayDuties.filter((d) => d.mobile).map((d) => d.id));
    setSelected(allIds);
  };

  const clearSelection = () => {
    setSelected(new Set());
  };

  const getWhatsAppLink = (mobile, msg) => {
    const cleanMobile = (mobile || "").replace(/\D/g, "");
    const encodedMsg = encodeURIComponent(msg);
    return `https://wa.me/${cleanMobile}?text=${encodedMsg}`;
  };

  // Option 1: Bulk open all (enhanced with delay)
  const handleBulkOpen = async (msg) => {
    if (selectedWithMobile.length === 0) return;
    setIsSending(true);
    
    for (let i = 0; i < selectedWithMobile.length; i++) {
      const d = selectedWithMobile[i];
      const link = getWhatsAppLink(d.mobile, msg);
      window.open(link, "_blank");
      // Add delay to prevent browser from blocking popup
      if (i < selectedWithMobile.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setIsSending(false);
  };

  // Option 2: Native Share (Web Share API) - works on mobile
  const handleNativeShare = (msg) => {
    if (selectedWithMobile.length === 0) return;
    
    // Open modal for step-by-step sending
    setNativeShareMsg(msg);
    setShareIndex(0);
    setSentCount(0);
    setShareModalOpen(true);
  };

  // Send to current recipient in native share modal
  const sendToCurrentRecipient = async () => {
    if (!navigator.share) {
      alert("Native share not supported on this device. Please use Copy to Clipboard.");
      return;
    }
    
    const currentRecipient = selectedWithMobile[shareIndex];
    try {
      await navigator.share({
        title: 'Exam Duty Message',
        text: nativeShareMsg,
      });
      setSentCount(prev => prev + 1);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    }
  };

  // Navigate to next recipient
  const goToNextRecipient = () => {
    if (shareIndex < selectedWithMobile.length - 1) {
      setShareIndex(prev => prev + 1);
    }
  };

  // Navigate to previous recipient
  const goToPrevRecipient = () => {
    if (shareIndex > 0) {
      setShareIndex(prev => prev - 1);
    }
  };

  // Close modal
  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareIndex(0);
    setSentCount(0);
  };

  // Option 3: Copy message + numbers to clipboard
  const handleCopyToClipboard = (msg) => {
    if (selectedWithMobile.length === 0) return;
    
    const recipients = selectedWithMobile
      .map(d => `${d.facultyName}: +${d.mobile}`)
      .join('\n');
    
    const fullText = `${msg}\n\n---Send to---\n${recipients}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopySuccess(`Copied! ${selectedWithMobile.length} recipients`);
      setTimeout(() => setCopySuccess(""), 3000);
    });
  };

  const templates = [
    { label: "Duty Reminder", msg: `Dear Faculty,\n\nThis is a reminder for your invigilation duty on ${fmtDate(date)}, Shift ${slot}.\n\nPlease be present 15 minutes before the exam starts.\n\nRegards,\nExam Controller` },
    { label: "Room Details", msg: `Dear Faculty,\n\nYour invigilation room for ${fmtDate(date)} Shift ${slot} is Room ________.\n\nPlease report to the Control Room before the exam.\n\nRegards,\nExam Controller` },
    { label: "Custom Message", msg: "" },
  ];
  const [customMsg, setCustomMsg] = useState("");

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>WhatsApp Message</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>
        Send WhatsApp messages to faculty about their duties.
      </div>

      <div style={{ ...S.card, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Select Date & Shift</label>
          <DateSlotPicker date={date} setDate={setDate} slot={slot} setSlot={setSlot} />
        </div>

        {date && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <StatCard value={stats.total} label="Total Faculty" color={C.blue} />
            <StatCard value={stats.withMobile} label="With Mobile" color={C.green} />
            <StatCard value={stats.selectedCount} label="Selected" color={C.gold} />
          </div>
        )}

        {date && dayDuties.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={selectAll} style={S.btnG}>
              Select All ({stats.withMobile})
            </button>
            <button onClick={clearSelection} style={S.btnG}>
              Clear
            </button>
          </div>
        )}
      </div>

      {date && dayDuties.length > 0 && (
        <>
          <div style={{ ...S.card, overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>
                    <input
                      type="checkbox"
                      checked={selected.size === stats.withMobile && stats.withMobile > 0}
                      onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                    />
                  </th>
                  {["Faculty", "Department", "Mobile", "Room", "Duty Type"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayDuties.map((d, i) => (
                  <tr
                    key={i}
                    style={{
                      background: selected.has(d.id) ? C.primary + "15" : i % 2 === 0 ? "transparent" : "#ffffff03",
                      cursor: d.mobile ? "pointer" : "default",
                    }}
                    onClick={() => d.mobile && toggleSelect(d.id)}
                  >
                    <td style={{ ...S.td, textAlign: "center" }}>
                      {d.mobile && (
                        <input
                          type="checkbox"
                          checked={selected.has(d.id)}
                          onChange={() => toggleSelect(d.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{d.facultyName || "-"}</td>
                    <td style={{ ...S.td, color: C.textMid }}>{d.dept || "-"}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: d.mobile ? C.teal : C.textDim }}>
                      {d.mobile || "—"}
                    </td>
                    <td style={{ ...S.td, fontWeight: 700, color: d.room ? C.primaryL : C.textDim }}>
                      {d.room || (d.isReserved ? "Standby" : "-")}
                    </td>
                    <td style={{ ...S.td, color: C.gold }}>{d.dutyType || "Invigilation"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ ...S.card, padding: "16px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>
              Message Templates
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {templates.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    const msg = t.msg || customMsg;
                    if (msg) {
                      handleBulkOpen(msg);
                    }
                  }}
                  disabled={selected.size === 0 || isSending}
                  style={{
                    ...S.btnP,
                    opacity: selected.size === 0 || isSending ? 0.5 : 1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            
            {/* Broadcast Options */}
            <div style={{ 
              background: C.surface || "#0d1530", 
              border: "1px solid " + C.border, 
              borderRadius: 8, 
              padding: 14, 
              marginBottom: 16 
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Broadcast Options
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleNativeShare(customMsg || templates[0].msg)}
                  disabled={selected.size === 0}
                  style={{
                    ...S.btnG,
                    borderColor: C.green + "55",
                    color: C.green,
                    opacity: selected.size === 0 ? 0.5 : 1,
                  }}
                >
                  📱 Native Share (Mobile)
                </button>
                <button
                  onClick={() => handleCopyToClipboard(customMsg || templates[0].msg)}
                  disabled={selected.size === 0}
                  style={{
                    ...S.btnG,
                    borderColor: C.blue + "55",
                    color: C.blue,
                    opacity: selected.size === 0 ? 0.5 : 1,
                  }}
                >
                  📋 Copy to Clipboard
                </button>
              </div>
              {copySuccess && (
                <div style={{ 
                  marginTop: 10, 
                  padding: '8px 12px', 
                  background: C.green + "15", 
                  borderRadius: 6, 
                  fontSize: 12, 
                  color: C.green 
                }}>
                  ✅ {copySuccess}
                </div>
              )}
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
                💡 <strong>Native Share</strong> opens your phone's share sheet → select WhatsApp → pre-filled message (tap send)<br/>
                💡 <strong>Copy</strong> copies message + all {selectedWithMobile.length} numbers for manual use
              </div>
            </div>

            <div>
              <label style={S.label}>Custom Message</label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your custom message here..."
                style={{
                  ...S.inp,
                  minHeight: 80,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              {customMsg && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleBulkOpen(customMsg)}
                    disabled={selected.size === 0 || isSending}
                    style={{
                      ...S.btnP,
                      background: "linear-gradient(135deg," + C.green + ",#077a4f)",
                      opacity: selected.size === 0 || isSending ? 0.5 : 1,
                    }}
                  >
                    {isSending ? "Opening..." : `📤 Send to ${selected.size} via WhatsApp Web`}
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(customMsg)}
                    disabled={selected.size === 0}
                    style={{
                      ...S.btnG,
                      color: C.blue,
                      borderColor: C.blue + "55",
                      opacity: selected.size === 0 ? 0.5 : 1,
                    }}
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => handleNativeShare(customMsg)}
                    disabled={selected.size === 0}
                    style={{
                      ...S.btnG,
                      color: C.purple,
                      borderColor: C.purple + "55",
                      opacity: selected.size === 0 ? 0.5 : 1,
                    }}
                  >
                    📱 Native Share
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {date && dayDuties.length === 0 && (
        <div style={{ textAlign: "center", color: C.textDim, padding: "40px 0" }}>
          No duties found for {fmtDate(date)} Shift {slot}.
        </div>
      )}

      {/* Native Share Progress Modal */}
      {shareModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400,
            backdropFilter: "blur(4px)",
            padding: 16,
          }}
          onClick={closeShareModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111a38",
              border: "1px solid #2a3f72",
              borderRadius: 13,
              padding: 24,
              width: "min(450px, 95vw)",
              maxWidth: "100%",
              boxShadow: "0 32px 80px #000e",
            }}
          >
            {/* Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>
                  📱 Native Share Progress
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  Sending to {selectedWithMobile.length} recipients
                </div>
              </div>
              <button
                onClick={closeShareModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8fa8d0",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 8,
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ 
              background: "#080d1e", 
              borderRadius: 8, 
              padding: 4, 
              marginBottom: 20 
            }}>
              <div style={{ 
                height: 8, 
                background: C.green, 
                borderRadius: 4, 
                width: `${(sentCount / selectedWithMobile.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Current Recipient */}
            <div style={{ 
              background: "#080d1e", 
              borderRadius: 10, 
              padding: 20, 
              marginBottom: 20,
              border: '1px solid ' + C.border 
            }}>
              <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Currently sending to ({shareIndex + 1} of {selectedWithMobile.length})
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                {selectedWithMobile[shareIndex]?.facultyName || "Unknown"}
              </div>
              <div style={{ fontSize: 14, color: C.teal, fontFamily: 'monospace' }}>
                📱 +{selectedWithMobile[shareIndex]?.mobile || "No number"}
              </div>
              
              {/* Message Preview */}
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                background: '#111a38', 
                borderRadius: 6,
                fontSize: 12,
                color: C.textMid,
                maxHeight: 100,
                overflow: 'auto'
              }}>
                <div style={{ color: C.textMid, marginBottom: 4 }}>Message:</div>
                <div style={{ color: C.text, whiteSpace: 'pre-wrap' }}>
                  {nativeShareMsg?.substring(0, 150)}
                  {nativeShareMsg?.length > 150 ? "..." : ""}
                </div>
              </div>
            </div>

            {/* Navigation & Send Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={goToPrevRecipient}
                disabled={shareIndex === 0}
                style={{
                  ...S.btnG,
                  flex: 1,
                  minWidth: 100,
                  opacity: shareIndex === 0 ? 0.4 : 1,
                }}
              >
                ← Previous
              </button>
              
              <button
                onClick={sendToCurrentRecipient}
                style={{
                  ...S.btnP,
                  background: "linear-gradient(135deg," + C.green + ",#077a4f)",
                  flex: 2,
                  minWidth: 140,
                }}
              >
                📤 Send Now
              </button>
              
              <button
                onClick={goToNextRecipient}
                disabled={shareIndex === selectedWithMobile.length - 1}
                style={{
                  ...S.btnG,
                  flex: 1,
                  minWidth: 100,
                  opacity: shareIndex === selectedWithMobile.length - 1 ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>

            {/* Status */}
            <div style={{ 
              marginTop: 16, 
              textAlign: 'center',
              fontSize: 13,
              color: C.textMid 
            }}>
              {sentCount > 0 && (
                <span style={{ color: C.green }}>
                  ✅ {sentCount} sent successfully
                </span>
              )}
              {sentCount === 0 && shareIndex === 0 && (
                <span>Tap "Send Now" to open WhatsApp share for this recipient</span>
              )}
            </div>

            {/* Completion Message */}
            {sentCount === selectedWithMobile.length && selectedWithMobile.length > 0 && (
              <div style={{
                marginTop: 16,
                padding: 16,
                background: C.green + "15",
                borderRadius: 8,
                textAlign: 'center',
                border: '1px solid ' + C.green + "44"
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 4 }}>
                  🎉 Broadcast Complete!
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  Sent to {sentCount} recipients
                </div>
                <button
                  onClick={closeShareModal}
                  style={{
                    ...S.btnP,
                    marginTop: 12,
                    width: '100%',
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}