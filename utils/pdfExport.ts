import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/attention-calculator';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface ExportData {
  user: any;
  screenTime: any[];
  subscriptions: any[];
  distractions: any[];
  goals: any[];
  focusActivities: any[];
  wallet: any;
}

export async function generatePDFData(userId: string): Promise<ExportData> {
  try {
    const [screenTimeData, subscriptionsData, distractionsData, goalsData, focusData, walletData] = await Promise.all([
      supabase.from('screen_time_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('distraction_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('focus_activities').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('attention_wallet').select('*').eq('user_id', userId).single(),
    ]);

    return {
      user: { id: userId },
      screenTime: screenTimeData.data || [],
      subscriptions: subscriptionsData.data || [],
      distractions: distractionsData.data || [],
      goals: goalsData.data || [],
      focusActivities: focusData.data || [],
      wallet: walletData.data || {},
    };
  } catch (error) {
    console.error('Failed to fetch export data:', error);
    throw error;
  }
}

export function generateHTMLReport(data: ExportData): string {
  const { screenTime, subscriptions, distractions, goals, focusActivities, wallet } = data;

  // Calculate summary statistics
  const totalScreenTime = screenTime.reduce((sum, entry) => sum + entry.hours, 0);
  const totalValueLost = screenTime.reduce((sum, entry) => sum + entry.est_value_lost, 0);
  const totalFocusHours = focusActivities.reduce((sum, entry) => sum + entry.hours, 0);
  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  const totalPickups = distractions.reduce((sum, log) => sum + log.pickup_count, 0);
  const totalNotifications = distractions.reduce((sum, log) => sum + log.notification_count, 0);

  // Group screen time by app
  const appUsage = screenTime.reduce((acc, entry) => {
    acc[entry.app_name] = (acc[entry.app_name] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  const topApps = Object.entries(appUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayMind Attention Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border-radius: 16px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: #f8fafc;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 8px 0;
            color: #6366f1;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 1.8em;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }
        .section {
            background: white;
            margin-bottom: 30px;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        .section-header {
            background: #f8fafc;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        .section-header h2 {
            margin: 0;
            color: #1f2937;
            font-size: 1.4em;
        }
        .section-content {
            padding: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            font-size: 0.9em;
        }
        .table th {
            background: #f8fafc;
            font-weight: 600;
            color: #374151;
        }
        .app-list {
            display: grid;
            gap: 12px;
        }
        .app-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .app-name {
            font-weight: 600;
            color: #1f2937;
        }
        .app-hours {
            color: #6366f1;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6b7280;
            font-size: 0.9em;
            border-top: 1px solid #e5e7eb;
        }
        .insight-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        .insight-box h4 {
            margin: 0 0 8px 0;
            color: #92400e;
        }
        .insight-box p {
            margin: 0;
            color: #78350f;
            font-size: 0.9em;
        }
        .wallet-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
        }
        .wallet-card {
            background: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .wallet-card h4 {
            margin: 0 0 8px 0;
            color: #6366f1;
            font-size: 0.8em;
            text-transform: uppercase;
        }
        .wallet-card .value {
            font-size: 1.5em;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }
        @media print {
            body { 
                background: white; 
                font-size: 12px;
            }
            .section { 
                box-shadow: none; 
                border: 1px solid #e5e7eb; 
                page-break-inside: avoid;
            }
            .header {
                background: #6366f1 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 PayMind Attention Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Screen Time</h3>
            <p class="value">${totalScreenTime.toFixed(1)}h</p>
        </div>
        <div class="summary-card">
            <h3>Attention Value Lost</h3>
            <p class="value">${formatCurrency(totalValueLost)}</p>
        </div>
        <div class="summary-card">
            <h3>Focus Hours</h3>
            <p class="value">${totalFocusHours.toFixed(1)}h</p>
        </div>
        <div class="summary-card">
            <h3>Monthly Subscriptions</h3>
            <p class="value">${formatCurrency(totalSubscriptionCost)}</p>
        </div>
    </div>

    ${wallet && Object.keys(wallet).length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>💰 Attention Wallet</h2>
        </div>
        <div class="section-content">
            <div class="wallet-grid">
                <div class="wallet-card">
                    <h4>Money Saved</h4>
                    <p class="value">${formatCurrency(wallet.money_saved || 0)}</p>
                </div>
                <div class="wallet-card">
                    <h4>Focus Points</h4>
                    <p class="value">${(wallet.total_points || 0).toLocaleString()}</p>
                </div>
                <div class="wallet-card">
                    <h4>Streak Days</h4>
                    <p class="value">${wallet.streak_days || 0}</p>
                </div>
                <div class="wallet-card">
                    <h4>Total Saved Time</h4>
                    <p class="value">${(wallet.total_saved_time || 0).toFixed(1)}h</p>
                </div>
            </div>
        </div>
    </div>
    ` : ''}

    ${topApps.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>📱 Top Apps by Usage</h2>
        </div>
        <div class="section-content">
            <div class="app-list">
                ${topApps.map(([app, hours]) => `
                    <div class="app-item">
                        <span class="app-name">${app}</span>
                        <span class="app-hours">${hours.toFixed(1)}h</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    ${distractions.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>📵 Distraction Summary</h2>
        </div>
        <div class="section-content">
            <div class="wallet-grid">
                <div class="wallet-card">
                    <h4>Total Phone Pickups</h4>
                    <p class="value">${totalPickups}</p>
                </div>
                <div class="wallet-card">
                    <h4>Total Notifications</h4>
                    <p class="value">${totalNotifications}</p>
                </div>
                <div class="wallet-card">
                    <h4>Avg Daily Pickups</h4>
                    <p class="value">${distractions.length > 0 ? (totalPickups / distractions.length).toFixed(1) : '0'}</p>
                </div>
                <div class="wallet-card">
                    <h4>Avg Daily Notifications</h4>
                    <p class="value">${distractions.length > 0 ? (totalNotifications / distractions.length).toFixed(1) : '0'}</p>
                </div>
            </div>
        </div>
    </div>
    ` : ''}

    ${goals.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>🎯 Goals Progress</h2>
        </div>
        <div class="section-content">
            <table class="table">
                <thead>
                    <tr>
                        <th>Goal</th>
                        <th>Target</th>
                        <th>Saved</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${goals.map(goal => `
                        <tr>
                            <td>${goal.title}</td>
                            <td>${formatCurrency(goal.target_amount)}</td>
                            <td>${formatCurrency(goal.current_saved)}</td>
                            <td>${((goal.current_saved / goal.target_amount) * 100).toFixed(1)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    ${subscriptions.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>💳 Subscriptions Analysis</h2>
        </div>
        <div class="section-content">
            <table class="table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Monthly Cost</th>
                        <th>Usage Hours</th>
                        <th>Cost per Hour</th>
                    </tr>
                </thead>
                <tbody>
                    ${subscriptions.map(sub => `
                        <tr>
                            <td>${sub.name}</td>
                            <td>${formatCurrency(sub.cost)}</td>
                            <td>${sub.usage_hours}h</td>
                            <td>${sub.usage_hours > 0 ? formatCurrency(sub.cost / sub.usage_hours) : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    ${focusActivities.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <h2>🧠 Focus Activities Breakdown</h2>
        </div>
        <div class="section-content">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Activity Type</th>
                        <th>Hours</th>
                        <th>Points Earned</th>
                    </tr>
                </thead>
                <tbody>
                    ${focusActivities.slice(0, 10).map(activity => `
                        <tr>
                            <td>${activity.date}</td>
                            <td>${activity.type.replace('_', ' ').toUpperCase()}</td>
                            <td>${activity.hours.toFixed(1)}h</td>
                            <td>${activity.points}</td>
                        </tr>
                    `).join('')}
                    ${focusActivities.length > 10 ? `
                        <tr>
                            <td colspan="4" style="text-align: center; font-style: italic; color: #6b7280;">
                                ... and ${focusActivities.length - 10} more activities
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <div class="insight-box">
        <h4>💡 Key Insights</h4>
        <p>
            You've tracked ${screenTime.length} screen time entries across ${Object.keys(appUsage).length} different apps. 
            ${totalValueLost > 0 ? `Your total attention value of ${formatCurrency(totalValueLost)} represents significant opportunity cost.` : 'Keep tracking to build awareness of your digital habits.'}
            ${totalFocusHours > 0 ? ` Your ${totalFocusHours.toFixed(1)} hours of focus activities demonstrate excellent commitment to personal development.` : ''}
            ${wallet?.streak_days > 7 ? ` Your ${wallet.streak_days}-day tracking streak shows great consistency!` : ''}
        </p>
    </div>

    <div class="section">
        <div class="section-header">
            <h2>📈 Recommendations</h2>
        </div>
        <div class="section-content">
            <ul style="margin: 0; padding-left: 20px;">
                ${totalValueLost > 5000 ? 
                  '<li>High attention loss detected. Consider setting app time limits and using focus modes.</li>' : 
                  '<li>Your attention usage appears reasonable. Continue monitoring for awareness.</li>'
                }
                ${subscriptions.length > 5 ? 
                  '<li>Review your subscriptions - you might have unused services costing you money.</li>' :
                  '<li>Your subscription count looks manageable. Good financial discipline!</li>'
                }
                ${totalFocusHours < 10 ? 
                  '<li>Try to increase focus activities for better attention ROI and personal growth.</li>' :
                  '<li>Excellent focus activity levels! Keep up these productive habits.</li>'
                }
                ${wallet?.streak_days < 7 ? 
                  '<li>Try to track daily for better insights and to build a consistent habit.</li>' :
                  '<li>Great tracking consistency! Your streak shows commitment to digital wellness.</li>'
                }
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>Generated by PayMind - Your Attention Tracker</strong></p>
        <p>This report helps you understand the true value of your attention and make intentional choices about your digital consumption.</p>
        <p style="margin-top: 16px; font-style: italic;">"Your attention is valuable. Spend it wisely."</p>
    </div>
</body>
</html>
  `;
}

export async function exportToPDF(userId: string): Promise<string> {
  try {
    const data = await generatePDFData(userId);
    
    if (Platform.OS === 'web') {
      // For web, return HTML that can be downloaded
      return generateHTMLReport(data);
    } else {
      // For mobile, generate actual PDF using expo-print
      const htmlContent = generateHTMLReport(data);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'PayMind Attention Report',
          UTI: 'com.adobe.pdf',
        });
      }

      return uri; // Return the file URI for mobile
    }
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

// Alternative function for mobile that saves to device storage
export async function savePDFToDevice(userId: string): Promise<string> {
  try {
    const data = await generatePDFData(userId);
    const htmlContent = generateHTMLReport(data);
    
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Create a permanent file in the document directory
    const fileName = `PayMind_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: permanentUri,
    });

    return permanentUri;
  } catch (error) {
    console.error('Failed to save PDF:', error);
    throw error;
  }
}